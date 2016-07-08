/// <reference path="./tes-data.ts"/>

export interface Record {
  type: string;
  size: number;
}

interface RecordField {
  name: string;
  type: RecordFieldType;
}

enum RecordFieldType {
  UInt8,
  UInt16LE,
  UInt32LE,
  FourChar,
}

export function getRecord(buffer: Buffer): Record {
  var record: Record = {
    type: buffer.toString('utf8', 0, 4),
    size: buffer.readUInt32LE(4),
  };

  var offset = 8;
  var fields = recordTypes[record.type];

  var read = (offset, field) => readField(record, buffer, offset, field);

  if (fields) {
    fields.forEach(field => offset = read(offset, field));
  }

  return record;
}

function readField(record: Record, buffer: Buffer, offset: number, field: RecordField): number {
  if (offset >= buffer.length) {
    return offset;
  } 

  var value = null;
  switch (field.type) {
    case RecordFieldType.UInt8:
      value = buffer.readUInt8(offset);
      if (value === 0)
        value = null;
      break;
    case RecordFieldType.UInt16LE:
      value = buffer.readUInt16LE(offset);
      if (value === 0)
        value = null;
      break;
    case RecordFieldType.UInt32LE:
      value = buffer.readUInt32LE(offset);
      if (value === 0)
        value = null;
      break;
    case RecordFieldType.FourChar:
      value = buffer.toString('utf8', offset, offset + 4);
      break;
  }
  if (value !== null)
    record[field.name] = value;

  return offset + fieldSize(field, record);
}

function fieldSize(fieldDef: RecordField, record?: Record) {
  switch(fieldDef.type) {
    case RecordFieldType.UInt8:
      return 1;
    case RecordFieldType.UInt16LE:
      return 2;
    case RecordFieldType.UInt32LE:
      return 4;
    case RecordFieldType.FourChar:
      return 4;
  }
  return 0;
}

// http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format#Groups
var fieldsGRUP: RecordField[] = [
  {name: 'label', type: RecordFieldType.UInt32LE},
  {name: 'groupType', type: RecordFieldType.UInt32LE},
  {name: 'stamp', type: RecordFieldType.UInt16LE},
  {name: 'unknown1', type: RecordFieldType.UInt16LE},
  {name: 'version', type: RecordFieldType.UInt16LE},
  {name: 'unknown2', type: RecordFieldType.UInt16LE},
];

var recordTypes: {[type:string]: RecordField[]} = {
  'GRUP': fieldsGRUP,
};