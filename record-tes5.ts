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
  ZString,
  LString,
  RBG,
}

export function getRecord(buffer: Buffer): Record {
  var record: Record = {
    type: buffer.toString('utf8', 0, 4),
    size: buffer.readUInt32LE(4),
  };

  var offset = 8;
  var fields = record.type === 'GRUP' ? fieldsGRUP : recordFields;
  var read = (offset, field) => readField(record, buffer, offset, field);

  fields.forEach(field => offset = read(offset, field));

  if (offset < buffer.length) {
    record['subRecords'] = [];
  }

  var compressed = record.type === 'GRUP' ? false : record['flags'] & 0x40000;
  if (compressed) {
    // not yet supported
    record['compressed'] = true;
    return record;
  }

  var subRecordFields = subRecordMap[record.type];

  // read subrecords
  while (offset < buffer.length) {
    var subRecord: Record = {
      type: buffer.toString('utf8', offset, offset + 4),
      size: buffer.readUInt16LE(offset + 4),
    };

    offset += 6;
    var subRecordEnd = offset + subRecord.size;

    if (subRecordFields && subRecord.type in subRecordFields) {
      readField(subRecord, buffer, offset, {name:'value', type:subRecordFields[subRecord.type]}, subRecord.size);
    }

    offset += subRecord.size;
    record['subRecords'].push(subRecord);
  }

  return record;
}

function readField(record: Record, buffer: Buffer, offset: number, field: RecordField, size?: number): number {
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
    case RecordFieldType.ZString:
      value = buffer.toString('utf8', offset, offset + size);
      break;
    case RecordFieldType.LString:
      value = buffer.readUInt32LE(offset); 
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

var recordFields: RecordField[] = [
  {name: 'flags', type: RecordFieldType.UInt32LE},
  {name: 'id', type: RecordFieldType.UInt32LE},
  {name: 'revision', type: RecordFieldType.UInt32LE},
  {name: 'version', type: RecordFieldType.UInt16LE},
  {name: 'unknown', type: RecordFieldType.UInt16LE},
];

var subRecordMap: {[type:string]: {[type:string]: RecordFieldType}} = {
  'CLFM': {
    'EDID': RecordFieldType.ZString,
    'FULL': RecordFieldType.LString,
    'CNAM': RecordFieldType.RBG,
    'FNAM': RecordFieldType.UInt32LE,
  },
};