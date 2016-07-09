// <reference path="./tes-data.ts"/>

export interface Record {
  type: string;
  size: number;
}

interface RecordField {
  name: string;
  type: FieldType;
}

export function getRecord(buffer: Buffer): Record {
  var record = <Record>{};
  readFields(record, buffer, 0, recordHeader);
  return record;
}

export function readFields(record: Record, buffer: Buffer, offset: number, fields: FieldArray): number {
  for (var field of fields) {
    offset = readField(record, buffer, offset, field);
  }

  // if (offset < buffer.length) {
  //   record['subRecords'] = [];
  // }

  // var compressed = record.type === 'GRUP' ? false : record['flags'] & 0x40000;
  // if (compressed) {
  //   // not yet supported
  //   record['compressed'] = true;
  //   return record;
  // }

  // //var subRecordFields = subRecordMap[record.type];

  // // read subrecords
  // while (offset < buffer.length) {
  //   var subRecord: Record = {
  //     type: buffer.toString('utf8', offset, offset + 4),
  //     size: buffer.readUInt16LE(offset + 4),
  //   };

  //   offset += 6;
  //   var subRecordEnd = offset + subRecord.size;

  //   // if (subRecordFields && subRecord.type in subRecordFields) {
  //   //   readField(subRecord, buffer, offset, {name:'value', type:subRecordFields[subRecord.type]}, subRecord.size);
  //   // }

  //   offset += subRecord.size;
  //   record['subRecords'].push(subRecord);
  // }

  return offset;
}

function nullIfEqual<T>(value: T, test: T) {
  return value === test ? null : value;  
}

interface FieldReader {
  (buffer:Buffer, offset:number, count: number): any;
}

var fieldReaders: {[fieldType:string]: FieldReader} = {
  char: (b,o,c) => nullIfEqual(b.toString('utf8', o, o+c), ''),
  uint16le: (b,o,c) => nullIfEqual(b.readUInt16LE(o), 0),
  uint32le: (b,o,c) => nullIfEqual(b.readUInt32LE(o), 0),
};

var fieldSize: {[fieldType: string]: number} = {
  char: 1,
  uint16le: 2,
  uint32le: 4,
}

function readField(record: Record, buffer: Buffer, offset: number, field: Field): number {
  if (offset >= buffer.length) {
    return offset;
  }

  // control flow analysis will magically make this awesome someday
  let name = field[0];
  let type:string;
  let count = 1;

  if (typeof field[1] === 'string') {
    type = <string>field[1];
  }
  else if (typeof field[1] === 'number') {
    count = <number>field[1];
    type = <string>field[2];
  }
  else if (Array.isArray(field[1])) {
    var newRecord = <Record>{};
    record[name] = newRecord;
    return readFields(newRecord, buffer, offset, <FieldArray>field[1]);
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
      return offset + count * fieldSize[type];
    }
  }

  return 0;
}

type FieldType = 'uint32le'|'uint16le'|'uint8'|'char';
type SimpleField = [string, FieldType];
type CountField = [string, number, FieldType];
type ConditionalFieldSet = [string, {[type:string]:FieldArray}, FieldArray];
type NestedFieldSet = [string, FieldArray];
type Field = SimpleField|CountField|ConditionalFieldSet|NestedFieldSet;

// trick to make this being recursive not blow up
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
interface FieldArray extends Array<Field> {}

// http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format
var recordHeader: Field[] = [
  ['type', 4, 'char'],
  ['size','uint32le'],
  ['type', {'GRUP': [
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

// var subRecordFields: {[type:string]: FieldType} = {
//   'CNAM': FieldType.RGB,
//   'EDID': FieldType.ZString,
//   'FNAM': FieldType.UInt32LE,
//   'FULL': FieldType.LString,
//   'INAM': FieldType.UInt32LE,
//   'NAME': FieldType.UInt32LE,
//   'PTDO': FieldType.UInt32LE, // x2
//   'XEZN': FieldType.UInt32LE,
//   // 'XPPA': FieldType.Empty,
//   // 'XPRD': FieldType.Float,
//   // 'VMAD': FieldType.VMAD,
// };