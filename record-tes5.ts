// <reference path="./tes-data.ts"/>

export interface Record {
  type: string;
  size: number;
  subRecords?: Record[];
}

export function getRecord(buffer: Buffer): Record {
  var record = <Record>{};

  // read in the header
  readFields(record, buffer, 0, recordHeader);

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

    readFields(subRecord, buffer, offset, subRecordFields);

    offset += subRecord.size + 6;
    record.subRecords.push(subRecord);
  }

  return record;
}

function readFields(record: Record, buffer: Buffer, offset: number, fields: FieldArray): number {
  if (!fields) {
    return offset;
  }

  for (var field of fields) {
    offset = readField(record, buffer, offset, field);
  }

  return offset;
}

function readField(record: Record, buffer: Buffer, offset: number, field: Field): number {
  if (offset >= buffer.length) {
    return offset;
  }

  // control flow analysis will magically make this awesome someday
  let name = field[0];
  let type:string;
  let count = 1;

  if (field.length === 3 && typeof field[2] === 'object' && !Array.isArray(field[2])) {
    var options = <FieldOptions>field[2];
    if (typeof options.size === 'string') {
      count = record[options.size];
    }
    else {
      count = <number>options.size;
    }
  }

  if (typeof field[1] === 'string') {
    type = <string>field[1];
  }
  else if (Array.isArray(field[1])) {
    if (count) {
      record[name] = [];
      for (var i = 0; i < count; ++i) {
        var newRecord = <Record>{};
        record[name].push(newRecord);
        offset = readFields(newRecord, buffer, offset, <FieldArray>field[1]);
      }
    }
  }
  else if (typeof field[1] === 'object') {
    var valueMap = <{[type:string]:FieldArray}>field[1];
    var fields = valueMap[record[name]];
    if (!fields) {
      fields = <FieldArray>field[2];
    }
    return readFields(record, buffer, offset, fields);
  }

  var reader = fieldReaders[type];
  if (reader) {
    var value = reader(buffer, offset, count)
    if (value !== null) {
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
  int8: (b,o,c) => nullIfEqual(b.readInt8(o), 0),
  int16le: (b,o,c) => nullIfEqual(b.readInt16LE(o), 0),
  int32le: (b,o,c) => nullIfEqual(b.readInt32LE(o), 0),
  uint8: (b,o,c) => nullIfEqual(b.readUInt8(o), 0),
  uint16le: (b,o,c) => nullIfEqual(b.readUInt16LE(o), 0),
  uint32le: (b,o,c) => nullIfEqual(b.readUInt32LE(o), 0),
};

var fieldSize: {[fieldType: string]: number} = {
  char: 1,
  int8: 1,
  int16le: 2,
  int32le: 4,
  uint8: 1,
  uint16le: 2,
  uint32le: 4,
}

interface FieldOptions {
  size?: string|number;
}

type FieldTypes = 'int32le'|'int16le'|'int8'|'uint32le'|'uint16le'|'uint8'|'char'|'byte';
type SimpleField = [string, FieldTypes];
type SimpleFieldOpt = [string, FieldTypes, FieldOptions];
type ConditionalFieldSet = [string, {[type:string]:FieldArray}, FieldArray];
type NestedFieldSet = [string, FieldArray];
type NestedFieldSetOpt = [string, FieldArray, FieldOptions];
type Field = SimpleField|SimpleFieldOpt|ConditionalFieldSet|NestedFieldSet|NestedFieldSetOpt;

// trick to make this being recursive not blow up
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
interface FieldArray extends Array<Field> {}

// http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format
var recordHeader: FieldArray = [
  ['type', 'char', {size:4}],
  ['size','uint32le'],
  ['type', {GRUP: [
    ['label', 'uint32le'],
    ['groupType', 'uint32le'],
    ['stamp', 'uint16le'],
    ['unknown1', 'uint16le'],
    ['version', 'uint16le'],
    ['unknown2', 'uint16le'],
  ]}, [
    ['flags','uint32le'],
    ['id','uint32le'],
    ['revision','uint32le'],
    ['version','uint16le'],
    ['unknown','uint16le'],
  ]],
];

var subRecordFields: FieldArray = [
  ['type', 'char', {size:4}],
  ['size', 'uint16le'],
  ['type', {
    CNAM: [
      ['r', 'byte'],
      ['g', 'byte'],
      ['b', 'byte'],
      ['unused', 'byte'],
    ],
    EDID: [
      ['value', 'char', {size:-1}],
    ],
    VMAD: [
      ['version', 'int16le'],
      ['objFormat', 'int16le'],
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

          }, []]

        ], {size:'propertyCount'}],
      ], {size:'scriptCount'}],
      ['fragments', [

      ]],
    ]
  }, []],
];
