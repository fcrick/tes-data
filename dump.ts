// <reference path="typings/index.d.ts" />

import fs = require('fs');
var numeral = require('numeral');

// Record or SubRecord
interface Record {
  type: string;
  subRecords?: Record[];
}

interface BlobField {
  name: string;
  type: BlobFieldType;
  size?: string;
}

enum BlobFieldType {
  UInt8,
  UInt16LE,
  UInt32LE,
  FourChar,
  UInt8Array,
}

interface BlobConditional {
  switchOn: string;
  fieldTable: {
    [index:string]: BlobInfo;
  };
  default: BlobInfo;
}

// what fields a record may have can depend on the value of other fields,
// recursively.  Probably overdoing it here.
interface BlobInfo {
  fields: BlobField[];
  conditional?: BlobConditional[]; //{
  //   switchOn: string;
  //   fieldTable: {
  //     [index:string]: BlobInfo;
  //   };
  //   default: BlobInfo;
  // }[];
  size?: string;
  sizeFix?: number;
  subRecordInfo?: BlobInfo;
}

var subRecordInfo: BlobInfo = {
  fields: [
    {name: 'type', type: BlobFieldType.FourChar},
    {name: 'dataSize', type: BlobFieldType.UInt16LE},
    {name: 'data', type: BlobFieldType.UInt8Array, size: 'dataSize'},
  ],
  size: 'dataSize',
  sizeFix: 6,
}

var recordInfo: BlobInfo = {
  fields: [
    {name: 'type', type: BlobFieldType.FourChar},
  ],
  conditional: [
    {
      switchOn: 'type',
      fieldTable: {GRUP: {
        fields: [
          {name: 'groupSize', type: BlobFieldType.UInt32LE},
          {name: 'label', type: BlobFieldType.UInt32LE},
          {name: 'groupType', type: BlobFieldType.UInt32LE},
          {name: 'stamp', type: BlobFieldType.UInt16LE},
          {name: 'unknown1', type: BlobFieldType.UInt16LE},
          {name: 'version', type: BlobFieldType.UInt16LE},
          {name: 'unknown2', type: BlobFieldType.UInt16LE},
        ],
        size: 'groupSize',
        subRecordInfo: recordInfo,
      }},
      default: {
        fields: [
          {name: 'dataSize', type: BlobFieldType.UInt32LE},
          {name: 'flags', type: BlobFieldType.UInt32LE},
          {name: 'id', type: BlobFieldType.UInt32LE},
          {name: 'revision', type: BlobFieldType.UInt32LE},
          {name: 'version', type: BlobFieldType.UInt16LE},
          {name: 'unknown', type: BlobFieldType.UInt16LE},
        ],
        size: 'dataSize',
        sizeFix: 24,
        subRecordInfo: subRecordInfo,
      },
    },
  ],
};

//recordInfo.conditional[0].fieldTable['GRUP'].subRecordInfo = recordInfo;

function blobFieldSize(fieldDef: BlobField, record?: Record) {
  switch(fieldDef.type) {
    case BlobFieldType.UInt8:
      return 1;
    case BlobFieldType.UInt16LE:
      return 2;
    case BlobFieldType.UInt32LE:
      return 4;
    case BlobFieldType.FourChar:
      return 4;
    case BlobFieldType.UInt8Array:
      return record && fieldDef.size ? record[fieldDef.size] : 0;
  }
  return 0;
}

function estimateBlobSize(blobInfo: BlobInfo) {
  var fieldsSize = (b: BlobInfo) => b.fields.reduce((p: number, c: BlobField) => p + blobFieldSize(c), 0);
  var size = fieldsSize(blobInfo);

  if (!blobInfo.conditional) {
    return size;
  }

  var estimateCondRulesSize = (condRules: BlobConditional) => Math.max(
      ...Object.keys(condRules.fieldTable).map(key => fieldsSize(condRules.fieldTable[key])),
      fieldsSize(condRules.default)
  );

  return blobInfo.conditional.map(condRules => estimateCondRulesSize(condRules)).reduce((a, b) => a + b, size);
}

function readBlobField(fieldDef: BlobField, buffer: Buffer, record: Record, offset: number): number {
  var value = null;
  switch (fieldDef.type) {
    case BlobFieldType.UInt8:
      value = buffer.readUInt8(offset);
      if (value === 0)
        value = null;
      break;
    case BlobFieldType.UInt16LE:
      value = buffer.readUInt16LE(offset);
      if (value === 0)
        value = null;
      break;
    case BlobFieldType.UInt32LE:
      value = buffer.readUInt32LE(offset);
      if (value === 0)
        value = null;
      break;
    case BlobFieldType.FourChar:
      value = buffer.toString('ascii', offset, offset + 4);
      break;
    case BlobFieldType.UInt8Array:
      if (fieldDef.size) {
        value = '<blob>'; //buffer.toString('hex', offset, offset + record[fieldDef.size]);
      }
      break;
  }
  if (value !== null)
    record[fieldDef.name] = value;

  return offset + blobFieldSize(fieldDef, record);
}

function readBlob(record: Record, info: BlobInfo, buffer: Buffer, offset?: number): number {
  if (typeof offset !== 'number')
    offset = 0;

  for (var fieldDef of info.fields) {
    offset = readBlobField(fieldDef, buffer, record, offset);
  }

  if (info.conditional) {
    info.conditional.forEach(cond => {
      var switchValue = record[cond.switchOn];
      var condRecord = cond.fieldTable[switchValue];
      if (!condRecord) {
        condRecord = cond.default;
      }

      offset = readBlob(record, condRecord, buffer, offset);
    });
  }

  return offset;
}

function getRecordSize(record: Record, blobInfo: BlobInfo): number {
  var size = null;
  if (blobInfo.size && record[blobInfo.size]) {
    size = record[blobInfo.size];
    if (blobInfo.sizeFix)
      size += blobInfo.sizeFix;
  }

  if (blobInfo.conditional) {
    for (var cond of blobInfo.conditional) {
      var condInfo = cond.fieldTable[record[cond.switchOn]];
      if (!condInfo) {
        condInfo = cond.default;
      }

      var condSize = getRecordSize(record, condInfo);
      if (condSize !== null) {
        size = condSize;
      }
    }
  }

  return size;
}

function getRecordSubRecordInfo(record: Record, blobInfo: BlobInfo): BlobInfo {
  var subInfo = blobInfo.subRecordInfo;
  if (blobInfo.conditional) {
    for (var cond of blobInfo.conditional) {
      var condInfo = cond.fieldTable[record[cond.switchOn]];
      if (!condInfo) {
        condInfo = cond.default;
      }

      var condSubInfo = getRecordSubRecordInfo(record, condInfo);
      if (condSubInfo !== null) {
        subInfo = condSubInfo;
      }
    }
  }
  return subInfo;
}

export function readRecord(fd: number, offset: number, callback: (r: Record) => void) {
  var length = estimateBlobSize(recordInfo);
  var buffer = new Buffer(length);
  fs.read(fd, buffer, 0, length, offset,
    function(err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer) {
      if (err) { console.log(err); return; }
      var record = <Record>{};
      readBlob(record, recordInfo, buffer);

      //console.log(JSON.stringify(record))

      // we need the size of the whole record, not just the header blob
      var recordSize = getRecordSize(record, recordInfo);
      var subInfo = getRecordSubRecordInfo(record, recordInfo)

      // read in the subrecords on this record, if there are any
      if (recordSize > buffer.length && subInfo) {
        var fieldsBuffer = new Buffer(recordSize - buffer.length);
        fs.read(fd, fieldsBuffer, 0, recordSize - buffer.length, offset + buffer.length,
          function(err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer) {
            if (err) { console.log(err); return; }
            record.subRecords = [];
            var offset = 0;
            while (offset < buffer.byteLength) {
              var subRecord = <Record>{};
              
              offset = readBlob(subRecord, subInfo, buffer, offset);
              
              record.subRecords.push(subRecord);
            }
            callback(record);
          }
        );
      }
      else {
        callback(record);
      }
    }
  );
}

function createReadCallback(fd: number, stats: fs.Stats, offset: number, results: Record[]) {
  return (r: Record) => {
    results.push(r);

    var nextOffset = offset + getRecordSize(r, recordInfo);
    //console.log(nextOffset);
    if (stats.size > nextOffset) {
    //if (nextOffset < 500000) {
      readRecord(fd, nextOffset, createReadCallback(fd, stats, nextOffset, results));
    }
    else {
      fs.writeFileSync('out.txt', JSON.stringify(results, null, 2));
      //console.log(JSON.stringify(results, null, 2));
    }
  }
}

// function createOnFstat(fd) {
//   return (err: NodeJS.ErrnoException, stats: fs.Stats) => {
//     readRecord(fd, 0, r => {
//       var recordSize = getRecordSize(r, headerInfo);
//       console.log(JSON.stringify(r, null, 2));
//     });
//   }
// }

function createOnFstat(fd) {
  return (err: NodeJS.ErrnoException, stats: fs.Stats) => {
    if (err) { console.log(err); return; }
    var results = [];
    readRecord(fd, 0, createReadCallback(fd, stats, 0, results));
  }
}

export function onOpen(err: NodeJS.ErrnoException, fd: number) {
  fs.fstat(fd, createOnFstat(fd));
}

//fs.open(process.argv[2], 'r', onOpen);

class TESDataImpl implements TESData {
  private m_count: number; 

  constructor(private path:string) {
  }

  count(): Promise<number> {
    return new Promise<number>((fulfill, reject) => {
      if (typeof this.m_count !== 'undefined') {
        fulfill(this.m_count);
        return; 
      }

      // ok, let's do some read work

      // to know the number of records in the top level of the file, we need
      // to read the size of every single one, which is crazy, but that's the
      // only way

      // lets try this craziness first
      var runningTotal = 0;

      fs.open(this.path, 'r', (err: NodeJS.ErrnoException, fd: number) => {
        fs.fstat(fd, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
          if (stats.size == 0) {
            fulfill(0);
          }
          else {
            var createRead = (offset: number) => (err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer) => {
              var newOffset = offset + buffer.readUInt32LE(4);
              if (buffer.toString('utf8', 0, 4) !== 'GRUP') {
                newOffset += 24;
              }
              runningTotal += 1;
              if (newOffset < stats.size) {
                fs.read(fd, buffer, 0, 8, newOffset, createRead(newOffset));
              }
              else {
                this.m_count = runningTotal;
                fulfill(runningTotal);
              }
            }

            var buffer = new Buffer(8);
            fs.read(fd, buffer, 0, 8, 0, createRead(0));
          }
        });
      });
    });
  }
}

export interface TESData {
  count(): Promise<number>;
}

export module TESData {
  export function open(path:string) {
    return <TESData>new TESDataImpl(path);
  }

  export function getRecordOffsets(path: string, origOffset: number, callback: (err:NodeJS.ErrnoException, offsets: number[]) => void) {
    fs.open(path, 'r', (err: NodeJS.ErrnoException, fd: number) => {
      if (err) {
        callback(err, null);
      }

      // close the file if we finish without errors
      let success = (err: NodeJS.ErrnoException, offsets: number[]) => {
        fs.close(fd, (err: NodeJS.ErrnoException) => {
          if (err) {
            callback(err, null);
          }
          else {
            callback(null, offsets);
          }
        });
      }

      let offsets = [];

      fs.fstat(fd, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (err) {
          callback(err, null);
          return;
        }

        if (stats.size == 0) {
          success(null, offsets);
        }
        else {
          // if origOffset isn't set, we're reading the whole file at the top level
          if (!origOffset) {
            var endOffset = stats.size;
          }

          var createRead = (offset: number) => (err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer) => {
            if (err) {
              callback(err, null);
              return;
            }

            var nextOffset = offset + buffer.readUInt32LE(4);
            if (buffer.toString('utf8', 0, 4) !== 'GRUP') {
              nextOffset += 24;
            }
            else if (!endOffset) {
              // we just started reading a group, use its size to scope our scan
              endOffset = nextOffset;
              nextOffset = offset + 24;
            }

            if (nextOffset < endOffset) {
              offsets.push(nextOffset);
              fs.read(fd, buffer, 0, 8, nextOffset, createRead(nextOffset));
            }
            else {
              success(null, offsets);
            }
          }

          var buffer = new Buffer(8);
          fs.read(fd, buffer, 0, 8, origOffset, createRead(origOffset));
        }
      });
    });
  }
}