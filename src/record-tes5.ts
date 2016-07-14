
import textEncoding = require('text-encoding');
var TextEncoder = textEncoding.TextEncoder;

export interface Record {
  size?: number;
  recordType?: string;
  type?: string; // subrecord type
  subRecords?: Record[];
}

export function getSubRecordOffsets(buffer: Buffer) {
  var offsets: number[] = [];

  // read the header, as we need to know if it's compressed
  var record = <Record>{};
  readFields(record, buffer, 0, recordHeader, {});

  // don't support GRUP, WRLD, or compressed
  if (['GRUP', 'WRLD'].indexOf(record['recordType']) !== -1 || record['flags'] & 0x40000)
    return offsets;

  var offset = 24;
  while (offset < buffer.length) {
    offsets.push(offset);
    offset += 6 + buffer.readUInt16LE(offset + 4);
  }

  return offsets;
}

export function getRecord(buffer: Buffer, context?: Object): Record {
  var record = <Record>{};

  if (typeof context === 'undefined') {
    // context is a way to persist values that are considered
    // elsewhere in parsing. Fields with the persist flag are added.
    // hopefully good enough
    context = {};
  }

  // read in the header
  readFields(record, buffer, 0, recordHeader, context);

  // header is always the same size
  var offset = 24;

  if (offset < buffer.length) {
    record['subRecords'] = [];
  }

  var compressed = record['recordType'] === 'GRUP' ? false : record['flags'] & 0x40000;
  if (compressed) {
    // not yet supported
    record['compressed'] = true;
    return record;
  }

  // localization flag check
  if (record['recordType'] === 'TES4' && record['flags'] & 0x80) {
    context['localized'] = true;
  }

  // read subrecords
  while (offset < buffer.length) {
    var subRecord = <Record>{};

    // cheating a little here to simplify repeating records
    var subSize = buffer.readUInt16LE(offset + 4);
    var endOffset = offset + subSize + 6;

    // include rest of buffer in this case
    if (record['recordType'] === 'WRLD' && buffer.toString('utf8', offset, offset + 4) === 'OFST') {
      endOffset = buffer.length;
      context['ofstSize'] = endOffset - offset - 6;
    }

    readFields(subRecord, buffer.slice(offset, endOffset), 0, subRecordFields, context);

    offset = endOffset;
    record.subRecords.push(subRecord);
  }

  return record;
}

export function writeRecord(record: Record, context?: Object): Buffer {
  if (typeof context === 'undefined') {
    // context is a way to persist values that are considered
    // elsewhere in parsing. Fields with the persist flag are added.
    // hopefully good enough
    context = {};
  }

  var results: Uint8Array[] = [];
  var write = (arr: Uint8Array) => results.push(arr); 

  writeFields(write, record, recordHeader, context);

  if (record.subRecords) {
    for (var subRecord of record.subRecords) {
      if (subRecord.type === 'OFST') {
        context['ofstSize'] = subRecord['value'].length;
      }

      writeFields(write, subRecord, subRecordFields, context);
    }
  }

  var length = results.reduce((sum, array) => sum + array.length, 0);
  var array = new Uint8Array(length);
  
  var offset = 0;
  for (var result of results) {
    array.set(result, offset);
    offset += result.length;
  }

  return Buffer.from(<any>array);
}

function writeFields(write: (arr: Uint8Array) => void, record: Record, fields: FieldArray, context: Object) {
  for (var field of fields) {
    writeField(write, record, field, context);
  }
}

var textEncoder = new TextEncoder();

function writeField(write: (arr: Uint8Array) => void, record: Record, field: Field, context: Object) {
  handleField(field, record, context, (name, type, count, options) => {
    // simple
    var writer = fieldWriters[type];
    if (writer && (!options || !options.omitIfZero || record[name])) {
      writer(write, record, name, type, count);
    }

    if (options.persist) {
      context[name] = record[name];
    }
  }, (name, fields) => {
    // nested
    if (record[name]) {
      for (var entry of record[name]) {
        writeFields(write, entry, fields, context);
      }
    }
  }, fields => {
    // condition resolve
    writeFields(write, record, fields, context);
  }, () => {

  });
}

interface FieldWriter {
  (write: (arr: Uint8Array) => void, record: Record, name: string, type: FieldTypes, count: number): void;
}

function numericWriter<T>(
  arrayType: { new (buffer: ArrayBuffer): T},
  write: (arr: Uint8Array) => void,
  record: Record,
  name: string,
  type: FieldTypes,
  count: number
) {
  var buffer = new ArrayBuffer(fieldSize[type] * count);
  var array = new arrayType(buffer);
  if (count === 1) {
    array[0] = name in record ? record[name] : 0;
  } else {
    for (var i of range(count)) {
      // debug
      if (typeof record[name] === 'undefined') {
        console.log(JSON.stringify(record));
        console.log(name);
        console.log(type);
        console.log(count);
      }
      // debug
      array[i] = record[name][i];
    }
  }
  write(new Uint8Array(buffer));
}

var fieldWriters: {[fieldType:string]: FieldWriter} = {
  char: (write, record, name, type, count) => {
    write(textEncoder.encode(record[name]));

    if (count === -1) {
      write(new Uint8Array(1));
    }
  },
  float: (write, record, name, type, count) => numericWriter(Float32Array, write, record, name, type, count),
  int8: (write, record, name, type, count) => numericWriter(Int8Array, write, record, name, type, count),
  int16le: (write, record, name, type, count) => numericWriter(Int16Array, write, record, name, type, count),
  int32le: (write, record, name, type, count) => numericWriter(Int32Array, write, record, name, type, count),
  uint8: (write, record, name, type, count) => numericWriter(Uint8Array, write, record, name, type, count),
  uint16le: (write, record, name, type, count) => numericWriter(Uint16Array, write, record, name, type, count),
  uint32le: (write, record, name, type, count) => numericWriter(Uint32Array, write, record, name, type, count),
};

function readFields(record: Record, buffer: Buffer, offset: number, fields: FieldArray, context: Object): number {
  if (!fields) {
    return offset;
  }

  for (var field of fields) {
    offset = readField(record, buffer, offset, field, context);
  }

  return offset;
}

function readField(record: Record, buffer: Buffer, offset: number, field: Field, context: Object): number {
  return handleField<number>(field, record, context, (name, type, count, options) => {
    // simple

    // allow us to skip fields that would be omitted if they are zero, if
    // we're out of buffer.
    if (options.omitIfZero && offset >= buffer.length) {
      return offset;
    }

    var reader = fieldReaders[type];
    if (reader) {
      var value = null;

      if (count !== 0) {
        value = reader(buffer, type, offset, count);
      }

      if (options && options.persist) {
        context[name] = value;
      }

      if (value !== null) {
        if (options && options.format === 'hex') {
          if (typeof value === 'number') {
            value = '0x'+value.toString(16);
          }
          else {
            value = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');
          }
        }
        record[name] = value;
      }

      if (count === -1) {
        count = value === null ? 1 : value.length + 1;
      }

      return offset + count * fieldSize[type];
    }
  }, (name, fields, count) => {
    // nested
    if (count) {
      record[name] = [];
      for (var i = 0; (i < count || count === -1) && offset < buffer.length; ++i) {
        var newRecord = <Record>{};
        record[name].push(newRecord);
        offset = readFields(newRecord, buffer, offset, <FieldArray>field[1], context);
      }
    }
    return offset;
  }, fields => {
    // condition resolve
    return fields ? readFields(record, buffer, offset, fields, context) : offset;
  }, () => {
    return offset;
  });
}

function getFieldCount(field: Field, record: Record, context: Object): number {
  var count = 1;

  if (field.length === 3 && field[2] && typeof field[2] === 'object' && !Array.isArray(field[2])) {
    var options = <FieldOptions>field[2];
    if (typeof options.size === 'string') {
      count = record[options.size];
      if (typeof count === 'undefined') {
        count = context[options.size];
        if (typeof count === 'undefined') {
          count = 0;
        }
      }
    }
    else if (typeof options.size === 'number') {
      count = <number>options.size;
    }

    if (typeof options.sizeOffset === 'number') {
      count += options.sizeOffset;
    }

    if (typeof options.sizeDivideBy === 'number') {
      count /= options.sizeDivideBy;
    }
  }

  return count;
}

function handleField<T>(
  field: Field,
  record: Record,
  context: Object,
  handleSimple: (name: string, type: FieldTypes, count: number, options: FieldOptions) => T,
  handleNesting: (name: string, fields: FieldArray, count:number) => T,
  handleCondition: (fields: FieldArray) => T,
  handleError: () => T
) {
  // control flow analysis will magically make this awesome someday
  let name = field[0];

  if (typeof field[1] === 'string') {
    return handleSimple(name, <FieldTypes>field[1], getFieldCount(field, record, context), field[2] || {});
  }
  else if (Array.isArray(field[1])) {
    return handleNesting(name, <FieldArray>field[1] || [], getFieldCount(field, record, context));
  }
  else if (typeof field[1] === 'object') {
    var valueMap = <{[type:string]:FieldArray}>field[1];
    var value = record[name];
    if (typeof value === 'undefined') {
      value = 0;
    }

    var fields = valueMap['_'+value];
    if (!fields) {
      var value = name in context ? context[name] : null;
      if (typeof value === 'undefined') {
        value = 0;
      }
      
      fields = valueMap['_'+value];
      if (!fields) {
        fields = <FieldArray>field[2];
      }
    }

    return handleCondition(fields || []);
  }

  return handleError();
}

function nullIfEqual<T>(value: T, test: T) {
  return value === test ? null : value;  
}

function nullIfZero(value: number) {
  return value === 0 && !isNegativeZero(value) ? null : value;  
}

interface FieldReader {
  (buffer:Buffer, type: FieldTypes, offset:number, count: number): any;
}

let range = function*(max: number) {
  for (let i = 0; i < max; i += 1)
    yield i
}

// http://stackoverflow.com/a/34461694
function isNegativeZero(n) {
  n = Number( n );
  return (n === 0) && (1 / n === -Infinity);
}

function numericReader(
  bufferReader: (offset: number) => number,
  fieldType: FieldTypes,
  offset: number,
  count: number
): number|number[] {
  if (count === 1) {
    return nullIfZero(bufferReader(offset));
  }
  else {
    return [...range(count)].map(i => bufferReader(offset + i * fieldSize[fieldType]));
  }
}

var fieldReaders: {[fieldType:string]: FieldReader} = {
  char: (b,t,o,c) => {
    if (c === -1) {
      var all = b.toString('utf8', o, b.length);
      return all.substr(0, all.indexOf('\0'));
    }
    else {
      return nullIfEqual(b.toString('utf8', o, o+c), '');
    }
  },
  float: (b,t,o,c) => numericReader(b.readFloatLE.bind(b), t, o, c),
  int8: (b,t,o,c) => numericReader(b.readInt8.bind(b), t, o, c),
  int16le: (b,t,o,c) => numericReader(b.readInt16LE.bind(b), t, o, c),
  int32le: (b,t,o,c) => numericReader(b.readInt32LE.bind(b), t, o, c),
  uint8: (b,t,o,c) => numericReader(b.readUInt8.bind(b), t, o, c),
  uint16le: (b,t,o,c) => numericReader(b.readUInt16LE.bind(b), t, o, c),
  uint32le: (b,t,o,c) => numericReader(b.readUInt32LE.bind(b), t, o, c),
};

var fieldSize: {[fieldType: string]: number} = {
  char: 1,
  float: 4,
  int8: 1,
  int16le: 2,
  int32le: 4,
  uint8: 1,
  uint16le: 2,
  uint32le: 4,
}

interface FieldOptions {
  size?: string|number;
  sizeOffset?: number;
  sizeDivideBy?: number;
  persist?: boolean;
  format?: 'hex';
  flag?: boolean;
  omitIfZero?: boolean;
}

type FieldTypes = 'int32le'|'int16le'|'int8'|'uint32le'|'uint16le'|'uint8'|'char'|'float';
type SimpleField = [string, FieldTypes];
type SimpleFieldOpt = [string, FieldTypes, FieldOptions];
type ConditionalFieldSet = [string, {[value:string]:FieldArray}];
type ConditionalFieldSet2 = [string, {[value:string]:FieldArray}, FieldArray];
type ConditionalFieldSet3 = [string, {[value:string]:FieldArray}, FieldArray, FieldOptions];
type NestedFieldSet = [string, FieldArray];
type NestedFieldSetOpt = [string, FieldArray, FieldOptions];
type Field = SimpleField|SimpleFieldOpt|ConditionalFieldSet|ConditionalFieldSet2|ConditionalFieldSet3|NestedFieldSet|NestedFieldSetOpt;

// trick to make this being recursive not blow up
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
interface FieldArray extends Array<Field> {}

// http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format
var recordHeader: FieldArray = [
  ['recordType', 'char', {size:4,persist:true}],
  ['size','uint32le'],
  ['recordType', {_GRUP: [
    ['label', 'uint32le'],
    ['groupType', 'uint32le'],
    ['stamp', 'uint16le'],
    ['unknown1', 'uint16le'],
    ['version', 'uint16le', {persist:true}],
    ['unknown2', 'uint16le'],
  ]}, [
    ['flags','uint32le'],
    ['id','uint32le',{format:'hex'}],
    ['revision','uint32le'],
    ['version','uint16le', {persist:true}],
    ['unknown','uint16le'],
  ]],
];

// simple types that are used frequently on their own
var unknown: FieldArray = [
  ['value', 'uint8', {size:'size'}]
];

var uint16le: FieldArray = [
  ['value', 'uint16le']
];

var uint32le: FieldArray = [
  ['value', 'uint32le']
];

var int8: FieldArray = [
  ['value', 'int8']
];

var float: FieldArray = [
  ['value', 'float']
];

var uint8: FieldArray = [
  ['value', 'uint8']
];

// just 'string' on uesp docs
var sString: FieldArray = [
  ['value', 'char', {size:'size'}],
];

var wString: FieldArray = [
  ['valueSize', 'uint16le'],
  ['value', 'char', {size:'valueSize'}],
];

var zString: FieldArray = [
  ['value', 'char', {size:-1}]
];

var lString: FieldArray = [
  ['localized', { _true: uint32le }, zString],
];

// more complicated sets of fields for re-use
var rgb: FieldArray = [
  ['r', 'uint8'],
  ['g', 'uint8'],
  ['b', 'uint8'],
  ['unused', 'uint8'],
];

var goldAndWeight: FieldArray = [
  ['goldValue', 'uint32le'],
  ['weight', 'float'],
];

var modt: FieldArray = [
  ['version', {
    _40: [
      ['count', 'uint32le'],
      ['unknown4count', 'uint32le'],
      ['unknown5count', 'uint32le'],
      ['unknown3', 'uint32le', {size:'count', sizeOffset:-2}],
      ['unknown4', [
        ['unknown1', 'uint32le'],
        ['textureType', 'char', {size:4}],
        ['unknown2', 'uint32le'],
      ], {size:'unknown4count'}],
      ['unknown5', 'uint32le', {size:'unknown5count'}],
    ],
  }, [
    ['entries', [
      ['unfdsfknown1', 'uint32le'],
      ['unknown2', 'char', {size:4}],
      ['unknown3', 'uint32le'],
    ], {size:-1}],
  ]],
];

var mods: FieldArray = [
  ['count', 'uint32le'],
  ['alternateTexture', [
    ['size', 'uint32le'],
    ['name', 'char', {size:'size'}],
    ['textureSet', 'uint32le'],
    ['index', 'uint32le'],
  ], {size:'count'}],
];

var scriptObject: FieldArray = [
  ['objFormat', {_1:[['formId','uint32le']]}], // prefix if objFormat is 1 (v1)
  ['alias', 'int16le'], // doc says this is unsigned in v2 but i think that's an error
  ['unused', 'uint16le'],
  ['objFormat', {_2:[['formId','uint32le']]}], // suffix in objFormat is 2 (v2)
];

var scriptBlock: FieldArray = [
  ['version', 'int16le'],
  ['objFormat', 'int16le', {persist:true}],
  ['scriptCount', 'uint16le'],
  ['scripts', [
    ['scriptNameSize', 'uint16le'],
    ['scriptName', 'char', {size:'scriptNameSize'}],
    ['status', 'uint8'],
    ['propertyCount', 'uint16le'],
    ['properties', [
      ['propertyNameSize', 'uint16le'],
      ['propertyName', 'char', {size:'propertyNameSize'}],
      ['propertyType', 'uint8'],
      ['status', 'uint8'],
      ['propertyType', {
        _1: scriptObject,
        _2: wString,
        _3: uint32le,
        _4: float,
        _5: int8,
        _11: [
          ['arraySize', 'uint32le'],
          ['arrayObject', scriptObject, {size: 'arraySize'}],
        ],
        _12: [
          ['arraySize', 'uint32le'],
          ['arrayString', wString, {size: 'arraySize'}],
        ],
        _13: [
          ['arraySize', 'uint32le'],
          ['arrayInt', 'int32le', {size: 'arraySize'}],
        ],
        _14: [
          ['arraySize', 'uint32le'],
          ['arrayFloat', 'float', {size: 'arraySize'}],
        ],
        _15: [
          ['arraySize', 'uint32le'],
          ['arrayBool', 'uint8', {size: 'arraySize'}],
        ],
      }],
    ], {size:'propertyCount'}],
  ], {size:'scriptCount'}]
];

var fragment: FieldArray = [
  ['unknown', 'int8'],
  ['scriptNameSize', 'uint16le'],
  ['scriptName', 'char', {size:'scriptNameSize'}],
  ['fragmentNameSize', 'uint16le'],
  ['fragmentName', 'char', {size:'fragmentNameSize'}],
];

var locationData: FieldArray = [
  ['x', 'float'],
  ['y', 'float'],
  ['z', 'float'],
  ['rX', 'float'],
  ['rY', 'float'],
  ['rZ', 'float'],
];

// large subrecords that appear in multiple records
var vmad: FieldArray = [
  ...scriptBlock,
  ['recordType', {
    _INFO: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
        }],
      ]}],
    ],
    _PACK: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
          _4: [['fragments', fragment, {size:1}]],
          _5: [['fragments', fragment, {size:2}]],
          _6: [['fragments', fragment, {size:2}]],
          _7: [['fragments', fragment, {size:3}]],
        }],
      ]}],
    ],
    _PERK: [
      ['alwaysTwo', 'uint8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['fragmentCount', 'uint16le'],
        ['fragments', [
          ['index', 'uint16le'],
          ['unknown1', 'uint16le'],
          ...fragment,
        ], {size:'fragmentCount'}],
      ]}],
    ],
    _QUST: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['fragmentCount', 'uint16le'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['fragments', [
          ['index', 'uint16le'],
          ['unknown1', 'int16le'],
          ['logEntry', 'int32le'],
          ...fragment,
        ], {size:'fragmentCount'}],
        ['aliasCount', 'uint16le'],
        ['aliases', [
          ...scriptObject,
          ...scriptBlock,
        ], {size:'aliasCount'}],
      ]}],
    ],
    _SCEN: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
        }],
        ['phaseCount', 'uint16le'],
        ['phases', [
          ['unknown1', 'int8'],
          ['phase', 'uint32le'],
          ...fragment,
        ], {size:'phaseCount'}],
      ]}],
    ],
  }],
];

var xapr: FieldArray = [
  ['formId', 'uint32le'],
  ['delay', 'float'],
];

var xesp: FieldArray = [
  ['parent', 'uint32le'],
  ['flags', 'uint32le'],
];

// record types
var achr: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _NAME: uint32le,
  _XEZN: uint32le,
  _XPRD: float,
  _INAM: uint32le,
  _PDTO: [
    ['type', 'uint32le'],
    ['formId', 'uint32le'],
  ],
  _XRGD: unknown,
  _XRGB: unknown,
  _XLCM: uint32le,
  _XADP: uint8,
  _XAPR: xapr,
  _XLRT: uint32le,
  _XHOR: uint32le,
  _XESP: xesp,
  _XOWN: uint32le,
  _XLCN: uint32le,
  _XLKR: [['formIds', 'uint32le', {size:'size', sizeDivideBy: 4}]],
  _XLRL: uint32le,
  _XSCL: float,
  _DATA: locationData,
}, unknown]];

var refr: FieldArray = [['type', { 
  _EDID: zString,
  _VMAD: vmad,
  _NAME: uint32le,
  _XMBO: [['value', 'float', {size:3}]],
  _XPRM: [
    ...locationData,
    ['unknown1', float],
    ['unknown2', uint32le],
  ],
  _XPOD: [
    ['origin', 'uint32le'],
    ['dest', 'uint32le'],
  ],
  _XRMR: [
    ['xrmrCount', 'uint8', {persist:true}],
    ['flags', 'uint8', {size:3}],
  ],
  _LNAM: uint32le,
  _INAM: uint32le,
  _SCHR: [
    ['unknown1', 'uint32le'],
    ['refCount', 'uint32le'],
    ['compiledSize', 'uint32le'],
    ['variableCount', 'uint32le'],
    ['schrType', 'uint32le'],
  ],
  _SCTX: sString,
  _QNAM: uint32le,
  _SCRO: uint32le,
  _XLRM: uint32le,
  _XRDS: float,
  _XEMI: uint32le,
  _XLIG: [
    ['fovOffset', 'float'],
    ['fadeOffset', 'float'],
    ['endDistanceCap', 'float'],
    ['shadowDepthBias', 'float'],
  ],
  _XESP: xesp,
  _XALP: [
    ['currentAlphaCutoff', 'uint8'],
    ['defaultAlphaCutoff', 'uint8'],
  ],
  _XNDP: [
    ['navm', 'uint32le'],
    ['unknown', 'uint32le'],
  ],
  _XTEL: [
    ['destinationDoor', 'uint32le'],
    ...locationData,
    ['flags', 'uint32le'],
  ],
  _XSCL: float,
  _XAPD: uint8,
  _XAPR: xapr,
  _XLIB: uint32le,
  _XLOC: [
    ['level', 'int8'],
    ['unknown1', 'uint8', {size:3}],
    ['formId', 'uint32le'],
    ['flags', 'uint8'],
    ['unknown2', 'uint8', {size:11}],
  ],
  _XLRT: uint32le,
  _XOWN: uint32le,
  _XCNT: uint32le,
  _XCVL: [['value', 'float', {size:3}]],
  _XCVR: [['value', 'float', {size:3}]],
  _XEZN: uint32le,
  _XFVC: float,
  _FNAM: uint8,
  _FULL: lString,
  _TNAM: uint16le,
  _XHTW: float,
  _XLCM: uint32le,
  _XMBR: uint32le,
  _XPWR: uint32le,
  _XTRI: uint32le,
  _XACT: uint32le,
  _XATR: uint32le,
  _XWCN: uint32le,
  _XWCU: [['value', 'float', {size:'size',sizeDivideBy:4}]],
  _XPRD: float,
  _PDTO: [
    ['type', 'uint32le'],
    ['formId', 'uint32le'],
  ],
  _XLRL: uint32le,
  _DATA: locationData,
}, unknown]];

var subRecordFields: FieldArray = [
  ['type', 'char', {size:4}],
  ['size', 'uint16le'],
  ['recordType', {
    _ACHR: achr,
    _REFR: refr,
  }, [
    ['type', {
      // simple subrecords
      _BAMT: uint32le,
      _BIDS: uint32le,
      _BMCT: sString,
      _BPTN: lString,
      _BPNN: zString,
      _BPNT: zString,
      _BPNI: zString,
      _CITC: uint32le,
      _DESC: lString,
      _DMDL: zString,
      _EAMT: uint16le,
      _EDID: zString,
      _EFID: uint32le,
      _EITM: uint32le,
      _ETYP: uint32le,
      _FCHT: zString,
      _FPRT: zString,
      _FULL: lString,
      _ICON: zString,
      _ICO2: zString,
      _INTV: uint32le,
      _KNAM: uint32le,
      _LLCT: uint8,
      _LVLD: uint8,
      _LVLF: uint8,
      _MCHT: zString, 
      _MICO: zString,
      _MIC2: zString,
      _MOD2: zString,
      _MOD3: zString,
      _MOD4: zString,
      _MOD5: zString,
      _MPRT: zString,
      _NVER: uint32le,
      _QUAL: uint32le,
      _RAGA: uint32le,
      _SLCP: uint8,
      _SOUL: uint8,
      _XAPD: uint8,
      _XEZN: uint32le,
      _XHOR: uint32le,
      _XLCM: uint32le,
      _XLCN: uint32le,
      _XLRL: uint32le,
      
      _XOWN: uint32le,
      _XPRD: float,
      _XRGD: unknown,
      _XRGB: unknown,
      _XSCL: float,
      _ZNAM: uint32le,
      // complex subrecords similar across all subrecords
      _AVSK: [
        ['skillUseMult', 'float'],
        ['skillUseOffset', 'float'],
        ['skillImproveMult', 'float'],
        ['skillImproveOffset', 'float'],
      ],
      _BODT: [
        ['bodyPartFlags', 'uint32le'],
        ['flags', 'uint8'],
        ['unknown1', 'uint8'],
        ['unknown2', 'uint16le'],
        ['version', {_20: [], _21: []}, [
          ['skill', 'uint32le'],
        ]],
      ],
      _BOD2: [
        ['bodyPartFlags', 'uint32le'],
        ['skill', 'uint32le'],
      ],
      _BPND: [
        ['damageMult', 'float'],
        ['flags', 'uint8'],
        ['partType', 'uint8'],
        ['healthPercent', 'uint8'],
        ['actorValue', 'int8'],
        ['toHitChance', 'uint8'],
        ['explodableChance', 'uint8'],
        ['explodableDebrisCount', 'uint16le'],
        ['explodableDebris', 'uint32le'],
        ['explodableExplosion', 'uint32le'],
        ['trackingMaxAngle', 'float'],
        ['explodableDebrisScale', 'float'],
        ['severableDebrisCount', 'int32le'],
        ['severableDebris', 'uint32le'],
        ['severableExplosion', 'uint32le'],
        ['severableDebrisScale', 'float'],
        ['tX', 'float'],
        ['tY', 'float'],
        ['tZ', 'float'],
        ['rX', 'float'],
        ['rY', 'float'],
        ['rZ', 'float'],
        ['severableImpactDataSet', 'uint32le'],
        ['explodableImpactDataSet', 'uint32le'],
        ['severableDecalCount', 'uint8'],
        ['explodableDecalCount', 'uint8'],
        ['unknown', 'uint16le'],
        ['limbReplacementScale', 'float'],
      ],
      _CTDA: [
        ['operator', 'uint8'],
        ['unknown1', 'uint8'],
        ['unknown2', 'uint16le'],
        ['operator', {_4: [
          ['comparisonFormId', 'uint32le'],
        ]}, [
          ['comparisonValue', 'float'],
        ], {flag:true}], // unimplemented until i find an example
        ['functionIndex', 'uint16le'],
        ['unknown3', 'uint16le'],
        ['params', 'uint8', {size:'size', sizeOffset:-12}],
      ],
      _DEST: [
        ['health', 'uint32le'],
        ['count', 'uint8'],
        ['flag', 'uint8'],
        ['unknown1', 'uint8'],
        ['unknown2', 'uint8'],
      ],
      _DSTD: [
        ['healthPercent', 'uint16le'],
        ['damageStage', 'uint8'],
        ['flags', 'uint8'],
        ['selfDamageRate', 'uint32le'],
        ['explosionId', 'uint32le'],
        ['debrisId', 'uint32le'],
        ['debrisCount', 'uint32le'],
      ],
      _EFIT: [
        ['magnitude', 'float'],
        ['areaOfEffect', 'uint32le'],
        ['duration', 'uint32le'],
      ],
      _HEDR: [
        ['version', 'float'],
        ['numRecords', 'int32le'],
        ['nextObjectId', 'uint32le'],
      ],
      _KSIZ: [['keywordCount', 'uint32le', {persist:true}]],
      _KWDA: [['keywords', 'uint32le', {size:'keywordCount'}]],
      _LVLO: [
        ['level', 'uint32le'],
        ['spellId', 'uint32le'],
        ['count', 'uint32le'],
      ],
      _MODT: modt, _DMDT: modt, _MO2T: modt, _MO3T: modt, _MO4T: modt, _MO5T: modt,
      _MODS: mods, _DMDS: mods, _MO2S: mods, _MO3S: mods, _MO4S: mods, _MO5S: mods,
      _NVMI: [
        ['navmesh', 'uint32le'],
        ['unknown1', 'uint32le'],
        ['x', 'float'],
        ['y', 'float'],
        ['z', 'float'],
        ['mergeFlags', 'uint32le'],
        ['mergeCount', 'uint32le'],
        ['mergedTo', 'uint32le', {size:'mergeCount'}],
        ['preferredCount', 'uint32le'],
        ['preferredMerges', 'uint32le', {size:'preferredCount'}],
        ['linkedDoors', 'uint32le'],
        ['doors', [
          ['unknown', 'uint32le'],
          ['door', 'uint32le'],
        ], {size:'linkedDoors'}],
        ['isIsland', 'uint8'],
        ['isIsland', {_0: []}, [
          ['minX', 'float'],
          ['minY', 'float'],
          ['minZ', 'float'],
          ['maxX', 'float'],
          ['maxY', 'float'],
          ['maxZ', 'float'],
          ['triangleCount', 'uint32le'],
          ['triangles', [
            ['indices', 'uint16le', {size:3}],
          ], {size:'triangleCount'}],
          ['vertexCount', 'uint32le'],
          ['vertices', [
            ['vertex', 'float', {size: 3}],
          ], {size:'vertexCount'}],
        ]],
        ['marker', 'uint32le'],
        ['worldSpace', 'uint32le'],
        ['worldSpace', {_60: [
          ['gridX', 'int16le'],
          ['gridY', 'int16le'],
        ]}, [
          ['cell', 'uint32le'],
        ]],
      ],
      _NVPP: [
        ['pathCount', 'uint32le'],
        ['paths', [
          ['formIdCount', 'uint32le'],
          ['pathFormId', 'uint32le', {size:'formIdCount'}],
        ], {size:'pathCount'}],
        ['indexSize', 'uint32le'],
        ['indices', [
          ['node', 'uint32le'],
          ['nodeIndex', 'uint32le'],
        ], {size: 'indexSize'}],
      ],
      _OBND: [
        ['x1', 'int16le'],
        ['y1', 'int16le'],
        ['z1', 'int16le'],
        ['x2', 'int16le'],
        ['y2', 'int16le'],
        ['z2', 'int16le'],
      ],
      _OFST: [
        ['value', 'uint8', {size:'ofstSize'}]
      ],
      _PTDO: [
        ['ptdoType', 'uint32le'],
        ['ptdoType', {
          _0: [['formId', 'uint32le']],
          _1: [['topic', 'char', {size:4}]],
        }],
      ],
      _VMAD: vmad,
      _WLST: [
        ['weather', 'uint32le'],
        ['percent', 'uint32le'],
        ['global', 'uint32le'],
      ],
      _XAPR: xapr,
      _XESP: xesp,
      _XLKR: [
        ['formIds', 'uint32le', {size:'size', sizeDivideBy: 4}],
      ],
      // subrecords that are different depending record type
      _ANAM: [['recordType', {
        _FOOO: zString,
        _WATR: uint8,
      }, unknown]],
      _BNAM: [['recordType', {
        _ANIO: zString,
        _ASPC: uint32le,
      }, unknown]],
      _CNAM: [['recordType', {
        _AACT: rgb,
        _AVIF: uint32le,
        _BOOK: lString,
        _TES4: zString,
      }, unknown]],
      _DATA: [
        ['recordType', {
          _ACHR: locationData,
          _ALCH: float,
          _AMMO: [
            ['formId', 'uint32le'],
            ['flags', 'uint32le'],
            ['damage', 'float'],
            ['goldValue', 'uint32le'],
          ],
          _APPA: goldAndWeight,
          _ARMO: goldAndWeight,
          _BOOK: [
            ['flags', 'uint8'],
            ['bookType', 'uint8'],
            ['unknown', 'uint16le'],
            ['teachFlags', 'uint32le'],
            ...goldAndWeight,
          ],
          _CAMS: [
            ['action', 'uint32le'],
            ['location', 'uint32le'],
            ['target', 'uint32le'],
            ['flags', 'uint32le'],
            ['playerTimeMult', 'float'],
            ['targetTimeMult', 'float'],
            ['globalTimeMult', 'float'],
            ['maxTime', 'float'],
            ['minTime', 'float'],
            ['betweenPercent', 'float'],
            ['nearTargetDistance', 'float', {omitIfZero:true}],
          ],
          _CELL: [
            ['entries', uint8, {size:-1}], // 1 or 2 bytes
          ],
          _CPTH: uint8,
          _DUAL: [
            ['projectile', 'uint32le'],
            ['explosion', 'uint32le'],
            ['effectShader', 'uint32le'],
            ['hitEffectArt', 'uint32le'],
            ['impactDataSet', 'uint32le'],
            ['flags', 'uint32le'],
          ],
          _DEBR: [
            ['percent', 'uint8'],
            ...zString,
            ['flags', 'uint8'],
          ],
          _EYES: uint8,
          _GRAS: [
            ['density', 'uint8'],
            ['minSlope', 'uint8'],
            ['maxSlope', 'uint8'],
            ['unknown1', 'uint8'],
            ['distanceFromWater', 'uint16le'],
            ['unknown2', 'uint16le'],
            ['howApplied', 'uint32le'],
            ['positionRange', 'float'],
            ['heightRange', 'float'],
            ['colorRange', 'float'],
            ['wavePeriod', 'float'],
            ['flags', 'uint32le'],
          ],
          _PERK: unknown,
          
          _REVB: [
            ['decayTime', 'uint16le'],
            ['HFReference', 'uint16le'],
            ['roomFilter', 'int8'],
            ['roomHFFilter', 'int8'],
            ['reflections', 'int8'],
            ['reverbAmp', 'int8'],
            ['decayHFRatio', 'uint8'],
            ['scaledReflectDelay', 'uint8'],
            ['reverbDelay', 'uint8'],
            ['diffusionPercent', 'uint8'],
            ['densityPercent', 'uint8'],
            ['unknown', 'uint8'],
          ],
          _SLGM: goldAndWeight,
          _SPGD: [
            ['gravityVelocity', 'float'],
            ['rotationVelocity', 'float'],
            ['sizeX', 'float'],
            ['sizeY', 'float'],
            ['centerOffsetMin', 'float'],
            ['centerOffsetMax', 'float'],
            ['initialRotationRange', 'float'],
            ['subtextureCountX', 'uint32le'],
            ['subtextureCountY', 'uint32le'],
            ['shaderType', 'uint32le'],
            ['boxSize', 'uint32le', {omitIfZero:true}],
            ['particleDensity', 'float', {omitIfZero:true}],
          ],
          _WATR: uint16le,
          _WRLD: uint8,
        }, unknown],
      ],
      _DNAM: [['recordType', {
        _ADDN: [
          ['particleCap', 'uint16le'],
          ['flags', 'uint16le'],
        ],
        _ARMA: [
          ['male', 'uint8'],
          ['female', 'uint8'],
          ['unknown1', 'uint32le'],
          ['detection', 'uint8'],
          ['unknown2', 'uint8'],
          ['weaponAdjust', 'float'],
        ],
        _DOBJ: [
          ['entries', [
            ['key', 'char', {size:4}],
            ['value', 'uint32le'],
          ], {size:-1}],
        ],
        _MATO: unknown,
        _VTYP: uint8,
      }, unknown]],
      _ENAM: [['recordType', {
        _FOOO: [['value', 'char', {size:4}]], // look for this
      }, unknown]],
      _ENIT: [['recordType', {
        _ALCH: [
          ['potionValue', 'uint32le'],
          ['flags', 'uint32le'],
          ['addiction', 'uint32le'],
          ['addictionChance', 'uint32le'],
          ['useSound', 'uint32le'],
        ],
        _INGR: goldAndWeight,
      }, unknown]],
      _FNAM: [['recordType', {
        _DOOR: uint8,
        _WATR: uint8,
        _CLMT: zString,
        _SNCT: uint32le,
      }, unknown]],
      _GNAM: [['recordType', {
        _FOOO: zString, // look for this
      }, unknown]],
      _HNAM: [['recordType', {
        _FOOO: float,
        _LTEX: uint16le,
      }, unknown]],
      _INAM: [['recordType', {
        _FOOO: uint16le,
        _MOVT: [
          ['directionScale', 'float'],
          ['movementSpeed', 'float'],
          ['rotationSpeed', 'float'],
        ],
      }, unknown]],
      _MNAM: [['recordType', {
        _COLL: zString,
        _WATR: uint8,
      }, unknown]],
      _MODL: [['recordType', {
        _APPA: zString,
        _BPTD: zString,
        _CAMS: zString,
        _CLMT: zString,
        _GRAS: zString,
        _MATO: zString,
        _SLGM: zString,
        _TACT: zString,
      }, unknown]],
      _NAME: [['recordType', {
        _RACE: zString,
      }, unknown]],
      _NAM0: [['recordType', {
        _FOOO: uint32le,
        _WATR: [['value', 'float', {size:3}]],
      }, unknown]],
      _NAM1: [['recordType', {
        _FOOO: uint32le,
        _BPTD: zString,
      }, unknown]],
      _NAM2: [['recordType', {
        _FOOO: uint32le,
        _WTHR: [['value', 'uint32le', {size:4}]],
      }, unknown]],
      _NAM3: [['recordType', {
        _FOOO: uint32le,
        _WTHR: [['value', 'uint32le', {size:4}]],
      }, unknown]],
      _NAM4: [['recordType', {
        _FOOO: zString,
        _WRLD: float,
      }, unknown]],
      _ONAM: [['recordType', {
        _AMMO: sString,
        _ARMA: uint32le,
      }, unknown]],
      _PNAM: [['recordType', {
        _ACTI: rgb,
        _EQUP: [
          ['formIds', [
            ['formId', 'uint32le'],
          ], {size:-1}]
        ],
      }, unknown]],
      _RDAT: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _RNAM: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _SNAM: [['recordType', {
        _LTEX: uint8,
      }, unknown]],
      _SNDD: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _TNAM: [['recordType', {
        _CLMT: [
          ['sunriseBegin', 'uint8'],
          ['sunriseEnd', 'uint8'],
          ['sunsetBegin', 'uint8'],
          ['sunsetEnd', 'uint8'],
          ['volatility', 'uint8'],
          ['moons', 'uint8'],
        ],
      }, unknown]],
      _UNAM: [['recordType', {
        _FOOO: uint16le,
        _WRLD: zString,
      }, unknown]],
      _VNAM: [['recordType', {
        _AVIF: float,
        _SNCT: uint16le,
      }, unknown]],
      _WNAM: [['recordType', {
        _FOOO: uint16le,
      }, unknown]],
      _XNAM: [['recordType', {
        _CELL: uint8,
      }, unknown]],
      _YNAM: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
    }, unknown],
  ]],
];
