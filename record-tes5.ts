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

  if (record.type == 'GRUP') {
  }

  return record;
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