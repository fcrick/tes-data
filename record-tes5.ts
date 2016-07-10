// <reference path="./tes-data.ts"/>

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
    if (options && options.repeat) {
      count = 99999999;
    }
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

    // if (options && options.repeat) {
    //   while (offset < buffer.length) {
    //     offset = readFields(record, buffer, offset, fields, context);
    //   }
    //   return offset;
    // }

    return fields ? readFields(record, buffer, offset, fields, context) : offset;
  }

  var reader = fieldReaders[type];
  if (reader) {
    var value = reader(buffer, offset, count)
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

function nullIfEqual<T>(value: T, test: T) {
  return value === test ? null : value;  
}

interface FieldReader {
  (buffer:Buffer, offset:number, count: number): any;
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
  byte: (b,o,c) => nullIfEqual(b.readUInt8(o), 0),
  float: (b,o,c) => nullIfEqual(b.readFloatLE(o), 0),
  int8: (b,o,c) => nullIfEqual(b.readInt8(o), 0),
  int16le: (b,o,c) => nullIfEqual(b.readInt16LE(o), 0),
  int32le: (b,o,c) => nullIfEqual(b.readInt32LE(o), 0),
  uint8: (b,o,c) => nullIfEqual(b.readUInt8(o), 0),
  uint16le: (b,o,c) => nullIfEqual(b.readUInt16LE(o), 0),
  uint32le: (b,o,c) => nullIfEqual(b.readUInt32LE(o), 0),
};

var fieldSize: {[fieldType: string]: number} = {
  char: 1,
  byte: 1,
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
  repeat?: boolean;
}

type FieldTypes = 'int32le'|'int16le'|'int8'|'uint32le'|'uint16le'|'uint8'|'char'|'byte'|'float';
type SimpleField = [string, FieldTypes];
type SimpleFieldOpt = [string, FieldTypes, FieldOptions];
type ConditionalFieldSet = [string, {[value:string]:FieldArray}, FieldArray];
type ConditionalFieldSet2 = [string, {[value:string]:FieldArray}];
type NestedFieldSet = [string, FieldArray];
type NestedFieldSetOpt = [string, FieldArray, FieldOptions];
type Field = SimpleField|SimpleFieldOpt|ConditionalFieldSet|ConditionalFieldSet2|NestedFieldSet|NestedFieldSetOpt;

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

var byte: FieldArray = [
  ['value', 'byte']
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
  ['r', 'byte'],
  ['g', 'byte'],
  ['b', 'byte'],
  ['unused', 'byte'],
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
    _ANAM: wString,
    _DMDL: zString,
    _EDID: zString,
    _FNAM: uint16le,
    _FULL: uint32le,
    _ICON: zString,
    _INAM: uint32le,
    _KNAM: uint32le,
    _MICO: zString,
    _MODL: zString,
    _MOD2: zString,
    _NAME: uint32le,
    _RNAM: uint32le,
    _SNAM: uint32le,
    _VNAM: uint32le,
    _WNAM: uint32le,
    _XAPD: byte,
    _XEZN: uint32le,
    _XHOR: uint32le,
    _XLCM: uint32le,
    _XLCN: uint32le,
    _XLRL: uint32le,
    _XLRT: uint32le,
    _XOWN: uint32le,
    _XPRD: float,
    _XRGD: unknown,
    _XRGB: unknown,
    _XSCL: float,
    _YNAM: uint32le,
    _ZNAM: uint32le,
    // complex subrecords
    _CNAM: rgb,
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
        _ADDN: uint32le,
        _ALCH: float,
      }],
    ],
    _DEST: [
      ['health', 'uint32le'],
      ['count', 'uint8'],
      ['flag', 'uint8'],
      ['unknown1', 'uint8'],
      ['unknown2', 'uint8'],
      ['stages', [
        ['type', 'char', {size:4}],
        ['size', 'uint16le'],
        ['type', {
          _DSTD: [
            ['healthPercent', 'uint16le'],
            ['damageStage', 'uint8'],
            ['flags', 'uint8'],
            ['selfDamageRate', 'uint32le'],
            ['explosionId', 'uint32le'],
            ['debrisId', 'uint32le'],
            ['debrisCount', 'uint32le'],
          ],
          _DMDL: zString,
          _DMDT: modt,
          _DMDS: mods,
          _DSTF: [],
        }],
      ], {repeat:true}]
    ],
    _DNAM: [
      ['particleCap', 'uint16le'],
      ['flags', 'uint16le'],
    ],
    _ENIT: [
      ['potionValue', 'uint32le'],
      ['flags', 'uint32le'],
      ['addiction', 'uint32le'],
      ['addictionChance', 'uint32le'],
      ['useSound', 'uint32le'],
      ['effects', [
        ['type', 'char', {size:4}],
        ['size', 'uint16le'],
        ['type', {
          _EFID: uint32le,
          _EFIT: [
            ['magnitude', 'float'],
            ['areaOfEffect', 'uint32le'],
            ['duration', 'uint32le'],
          ],
          // _CTDA: [

          // ],
        }],
      ], {repeat: true}],
    ],
    _KSIZ: [['keywordCount', 'uint32le', {persist:true}]],
    _KWDA: [['keywords', 'uint32le', {size:'keywordCount'}]],
    _MODT: modt, _DMDT: modt, _MO2T: modt,
    _MODS: mods, _DMDS: mods, _MO2S: mods,
    _OBND: [
      ['x1', 'int16le'],
      ['y1', 'int16le'],
      ['z1', 'int16le'],
      ['x2', 'int16le'],
      ['y2', 'int16le'],
      ['z2', 'int16le'],
    ],
    _PNAM: rgb,
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
              ['objFormat', {_1:[['formId','uint32le']]}],
              ['alias', 'int16le'], // doc says this is unsigned in v2 but i think that's an error
              ['unused', 'uint16le'],
              ['objFormat', {_2:[['formId','uint32le']]}],
            ],
            _2: wString,
            _3: uint32le,
            _4: float,
            _5: int8,
          }],
        ], {size:'propertyCount'}],
      ], {size:'scriptCount'}],
      // ['fragments', [

      // ]],
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
  }],
];
