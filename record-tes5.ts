// <reference path="./tes-data.ts"/>

import textEncoding = require('text-encoding');
var TextEncoder = textEncoding.TextEncoder;

export interface Record {
  type: string;
  size: number;
  subRecords?: Record[];
}

export function getRecord(buffer: Buffer): Record {
  var record = <Record>{};

  // context is a way to persist values that are considered
  // elsewhere in parsing. Fields with the persist flag are added.
  // hopefully good enough
  var context = {};

  // read in the header
  readFields(record, buffer, 0, recordHeader, context);

  // header is always the same size
  var offset = 24;

  if (offset < buffer.length) {
    record.subRecords = [];
  }

  var compressed = record.type === 'GRUP' ? false : record['flags'] & 0x40000;
  if (compressed) {
    // not yet supported
    record['compressed'] = true;
    return record;
  }

  // read subrecords
  while (offset < buffer.length) {
    var subRecord = <Record>{};

    readFields(subRecord, buffer, offset, subRecordFields, context);

    offset += subRecord.size + 6;
    record.subRecords.push(subRecord);
  }

  return record;
}

export function writeRecord(record: Record): Buffer {
  var context = new Object();

  var results: Uint8Array[] = [];
  var write = (arr: Uint8Array) => results.push(arr); 

  writeFields(write, record, recordHeader, context);

  if (record.subRecords) {
    for (var subRecord of record.subRecords) {
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
    if (writer) {
      writer(write, record, name, type, count);
    }

    if (options.persist) {
      context[name] = record[name];
    }
  }, (name, fields) => {
    // nested

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
  array[0] = record[name];
  write(new Uint8Array(buffer));
}

var fieldWriters: {[fieldType:string]: FieldWriter} = {
  char: (write, record, name, type, count) => {
    write(textEncoder.encode(record[name]));

    if (count === -1) {
      write(new Uint8Array(1));
    }
  },
  // float: (b,o,c) => nullIfEqual(b.readFloatLE(o), 0),
  float: (write, record, name, type, count) => numericWriter(Float32Array, write, record, name, type, count),
  int8: (write, record, name, type, count) => numericWriter(Int8Array, write, record, name, type, count),
  int16le: (write, record, name, type, count) => numericWriter(Int16Array, write, record, name, type, count),
  int32le: (write, record, name, type, count) => numericWriter(Int32Array, write, record, name, type, count),
  uint8: (write, record, name, type, count) => numericWriter(Uint8Array, write, record, name, type, count),
  uint16le: (write, record, name, type, count) => numericWriter(Uint16Array, write, record, name, type, count),
  uint32le: (write, record, name, type, count) => numericWriter(Uint32Array, write, record, name, type, count),
};

  // handleSimple: (name: string, type: FieldTypes, count: number) => void,
  // handleNesting: (name: string, fields: FieldArray) => void,
  // handleCondition: (fields: FieldArray) => void,
  // handleError: () => void

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
  if (offset >= buffer.length) {
    return offset;
  }

  // control flow analysis will magically make this awesome someday
  let name = field[0];
  let type:string;
  let count = 1;

  // really seems like the below logic should be put into a function
  // and given callbacks for the different scenarios or something, so
  // the code understanding the format is limited, and exposed for others.
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
  }

  if (typeof field[1] === 'string') {
    type = <string>field[1];
  }
  else if (Array.isArray(field[1])) {
    if (count) {
      record[name] = [];
      for (var i = 0; i < count && offset < buffer.length; ++i) {
        var newRecord = <Record>{};
        record[name].push(newRecord);
        offset = readFields(newRecord, buffer, offset, <FieldArray>field[1], context);
      }
    }
  }
  else if (typeof field[1] === 'object') {
    var valueMap = <{[type:string]:FieldArray}>field[1];
    var fields = valueMap['_'+record[name]];
    if (!fields) {
      fields = valueMap['_'+context[name]];
      if (!fields) {
        fields = <FieldArray>field[2];
      }
    }

    return fields ? readFields(record, buffer, offset, fields, context) : offset;
  }

  var reader = fieldReaders[type];
  if (reader) {
    var value = null;

    if (count !== 0) {
      value = reader(buffer, offset, count);
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

  return offset;
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
  }

  return count;
}

function handleField(
  field: Field,
  record: Record,
  context: Object,
  handleSimple: (name: string, type: FieldTypes, count: number, options: FieldOptions) => void,
  handleNesting: (name: string, fields: FieldArray) => void,
  handleCondition: (fields: FieldArray) => void,
  handleError: () => void
) {
  // control flow analysis will magically make this awesome someday
  let name = field[0];

  if (typeof field[1] === 'string') {
    return handleSimple(name, <FieldTypes>field[1], getFieldCount(field, record, context), field[2] || {});
  }
  else if (Array.isArray(field[1])) {
    return handleNesting(name, <FieldArray>field[1] || []);
  }
  else if (typeof field[1] === 'object') {
    var valueMap = <{[type:string]:FieldArray}>field[1];
    var fields = valueMap['_'+record[name]];
    if (!fields) {
      fields = valueMap['_'+context[name]];
      if (!fields) {
        fields = <FieldArray>field[2];
      }
    }

    return handleCondition(fields || []);
  }

  handleError();
}

function nullIfEqual<T>(value: T, test: T) {
  return value === test ? null : value;  
}

interface FieldReader {
  (buffer:Buffer, offset:number, count: number): any;
}

let range = function*(max: number) {
  for (let i = 0; i < max; i += 1)
    yield i
}

var fieldReaders: {[fieldType:string]: FieldReader} = {
  char: (b,o,c) => {
    if (c === -1) {
      var all = b.toString('utf8', o, b.length);
      return all.substr(0, all.indexOf('\0'));
    }
    else {
      return nullIfEqual(b.toString('utf8', o, o+c), '');
    }
  },
  float: (b,o,c) => nullIfEqual(b.readFloatLE(o), 0),
  int8: (b,o,c) => nullIfEqual(b.readInt8(o), 0),
  int16le: (b,o,c) => nullIfEqual(b.readInt16LE(o), 0),
  int32le: (b,o,c) => nullIfEqual(b.readInt32LE(o), 0),
  uint8: (b,o,c) => nullIfEqual(b.readUInt8(o), 0),
  uint16le: (b,o,c) => nullIfEqual(b.readUInt16LE(o), 0),
  uint32le: (b,o,c) => {
    // TODO all numerics should have this behavior
    if (c === 1) {
      return nullIfEqual(b.readUInt32LE(o), 0)
    }
    else {
      return [...range(Math.min(c, Math.floor((b.length-o)/4)))].map(i => b.readUInt32LE(o+i*4));
    }
  },
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
  persist?: boolean;
  format?: 'hex';
  flag?: boolean;
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
    ['version', 'uint16le'],
    ['unknown2', 'uint16le'],
  ]}, [
    ['flags','uint32le'],
    ['id','uint32le',{format:'hex'}],
    ['revision','uint32le'],
    ['version','uint16le'],
    ['unknown','uint16le'],
  ]],
];

var unknown: FieldArray = [
  ['value', 'char', {size:'size', format:'hex'}]
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

// not implemented other thing but keeping them separate for later
var lString = uint32le;

// just 'string' on uesp docs
var sString: FieldArray = [
  ['value', 'char', {size:'size'}],
];

var wString: FieldArray = [
  ['valueSize', 'uint16le'],
  ['value', 'char', {size:'valueSize'}],
];

// probably should add a null-terminated option instead
var zString: FieldArray = [
  ['value', 'char', {size:-1}]
];

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

var subRecordFields: FieldArray = [
  ['type', 'char', {size:4}],
  ['size', 'uint16le'],
  ['type', {
    // simple subrecords
    _ANAM: zString,
    _BAMT: uint32le,
    _BIDS: uint32le,
    _BMCT: sString,
    _BPTN: lString,
    _BPNN: zString,
    _BPNT: zString,
    _BPNI: zString,
    _DESC: lString,
    _DMDL: zString,
    _EAMT: uint16le,
    _EDID: zString,
    _EFID: uint32le,
    _EITM: uint32le,
    _ETYP: uint32le,
    _FCHT: zString,
    _FNAM: uint16le,
    _FPRT: zString,
    _FULL: lString,
    _HNAM: float,
    _ICON: zString,
    _ICO2: zString,
    _INAM: uint32le,
    _INTV: uint32le,
    _KNAM: uint32le,
    _MCHT: zString, 
    _MICO: zString,
    _MIC2: zString,
    _MNAM: uint32le,
    _MOD2: zString,
    _MOD3: zString,
    _MOD4: zString,
    _MOD5: zString,
    _MPRT: zString,
    _NAME: uint32le,
    _NAM0: uint32le,
    _NAM2: uint32le,
    _NAM3: uint32le,
    _NAM4: zString,
    _QUAL: uint32le,
    _RAGA: uint32le,
    _RDAT: uint32le,
    _RNAM: uint32le,
    _SNAM: uint32le,
    _SNDD: uint32le,
    _TNAM: uint32le,
    _WNAM: uint32le,
    _XAPD: uint8,
    _XEZN: uint32le,
    _XHOR: uint32le,
    _XLCM: uint32le,
    _XLCN: uint32le,
    _XLRL: uint32le,
    _XLRT: uint32le,
    _XNAM: uint32le,
    _XOWN: uint32le,
    _XPRD: float,
    _XRGD: unknown,
    _XRGB: unknown,
    _XSCL: float,
    _YNAM: uint32le,
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
      ['skill', 'uint32le'],
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
      ['functionIndex', {_576: [
        ['param1', 'uint16le'],
        ['param2', 'char', {size:2}],
        ['param3', 'uint32le'],
        ['runOnType', 'uint32le'],
        ['reference', 'uint32le'],
        ['unknown4', 'int32le'],
      ]}, [
        ['param1', 'uint32le'],
        ['param2', 'uint32le'],
      ]],
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
    _ENIT: [
      ['potionValue', 'uint32le'],
      ['flags', 'uint32le'],
      ['addiction', 'uint32le'],
      ['addictionChance', 'uint32le'],
      ['useSound', 'uint32le'],
    ],
    _HEDR: [
      ['version', 'float'],
      ['numRecords', 'int32le'],
      ['nextObjectId', 'uint32le'],
    ],
    _KSIZ: [['keywordCount', 'uint32le', {persist:true}]],
    _KWDA: [['keywords', 'uint32le', {size:'keywordCount'}]],
    _MODT: modt, _DMDT: modt, _MO2T: modt, _MO3T: modt, _MO4T: modt, _MO5T: modt,
    _MODS: mods, _DMDS: mods, _MO2S: mods, _MO3S: mods, _MO4S: mods, _MO5S: mods,
    _OBND: [
      ['x1', 'int16le'],
      ['y1', 'int16le'],
      ['z1', 'int16le'],
      ['x2', 'int16le'],
      ['y2', 'int16le'],
      ['z2', 'int16le'],
    ],
    _PTDO: [
      ['type', 'uint32le'],
      ['type', {
        _0: [['formId', 'uint32le']],
        _1: [['topic', 'char', {size:4}]],
      }],
    ],
    _VMAD: [
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
            _1: [
              ['objFormat', {_1:[['formId','uint32le']]}], // prefix if objFormat is 1 (v1)
              ['alias', 'int16le'], // doc says this is unsigned in v2 but i think that's an error
              ['unused', 'uint16le'],
              ['objFormat', {_2:[['formId','uint32le']]}], // suffix in objFormat is 2 (v2)
            ],
            _2: wString,
            _3: uint32le,
            _4: float,
            _5: int8,
          }],
        ], {size:'propertyCount'}],
      ], {size:'scriptCount'}],
    ],
    _XAPR: [
      ['formId', 'uint32le'],
      ['delay', 'float'],
    ],
    _XESP: [
      ['formId', 'uint32le'],
      ['flags', 'uint32le'],
    ],
    _XLKR: [
      ['formIdKYWD', 'uint32le'],
      ['formIdSTAT', 'uint32le'],
    ],
    // subrecords that are different depending record type
    _BNAM: [
      ['recordType', {
        _ANIO: zString,
        _ASPC: uint32le,
      }],
    ],
    _CNAM: [
      ['recordType', {
        _AACT: rgb,
        _AVIF: uint32le,
        _BOOK: lString,
        _TES4: zString,
      }],
    ],
    _DATA: [
      ['recordType', {
        _ACHR: [
          ['x', 'float'],
          ['y', 'float'],
          ['z', 'float'],
          ['rX', 'float'],
          ['rY', 'float'],
          ['rZ', 'float'],
        ],
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
          ['type', 'uint8'],
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
          ['nearTargetDistance', 'float'],
        ],
      }, uint32le],
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
    }, uint32le]],
    _MODL: [['recordType', {
      _APPA: zString,
      _CAMS: zString,
    }, uint32le]],
    _NAM1: [['recordType', {
      _FOOO: uint32le,
      _BPTD: zString,
    }]],
    _ONAM: [['recordType', {
      _AMMO: sString,
      _ARMA: uint32le,
    }]],
    _PNAM: [['recordType', {
      _ACTI: rgb,
      _AVIF: uint32le,
    }]],
    _VNAM: [['recordType', {
      _ACTI: uint32le,
      _AVIF: float,
    }]],
  }],
];
