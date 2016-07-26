import { readFields, writeFields } from './fields'
import { deflateRecordBuffer, inflateRecordBuffer } from './compression'
import * as tes5 from './tes5/types'

export function getSubRecordOffsets(buffer: Buffer) {
  var offsets: number[] = [];

  // read the header, as we need to know if it's compressed
  var record = {};
  readFields(record, buffer, 0, tes5.recordHeader, {});

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

export function readRecord(
  buffer: Buffer,
  callback: (err: NodeJS.ErrnoException, record: Object) => void,
  context?: Object
) {
  try {
    var record = {};

    if (typeof context === 'undefined') {
      // context is a way to persist values that are considered
      // elsewhere in parsing. Fields with the persist flag are added.
      // hopefully good enough
      context = {};
    }

    var contextCopy = {};
    Object.keys(context).forEach(k => contextCopy[k] = context[k]);

    // read in the header
    readFields(record, buffer, 0, tes5.recordHeader, contextCopy);

    // header is always the same size
    var offset = 24;

    if (offset < buffer.length) {
      record['subRecords'] = [];
    }

    // localization flag check
    if (record['recordType'] === 'TES4' && record['flags'] & 0x80) {
      contextCopy['localized'] = true;
    }

    var newCallback = (err: NodeJS.ErrnoException, record: Object) => {
      Object.keys(contextCopy).forEach(k => context[k] = contextCopy[k]);
      callback(err, record);
    };

    inflateRecordBuffer(buffer, (err, inflated, level) => {
      if (err) {
        newCallback(err, null);
      }
      else {
        if (level) {
          record['compressed'] = true;
          record['compressionLevel'] = level;
        }
        readSubRecords(inflated.slice(24), record, contextCopy, newCallback)
      }
    });
  }
  catch (err) {
    callback(err, null);
  }
}

function readSubRecords(
  buffer: Buffer,
  record: Object,
  context: Object,
  callback: (err: NodeJS.ErrnoException, record: Object) => void
) {
  var offset = 0;

  // read subrecords
  while (offset < buffer.length) {
    var subRecord = {};

    // cheating a little here to simplify repeating records
    var subSize = buffer.readUInt16LE(offset + 4);
    var endOffset = offset + subSize + 6;

    if (context['xxxxSize']) {
      var hadXXXX = true;
      endOffset += context['xxxxSize'];
    }

    readFields(subRecord, buffer.slice(offset, endOffset), 0, tes5.subRecordFields, context);

    if (hadXXXX) {
      delete context['xxxxSize'];
      hadXXXX = false;
    }

    offset = endOffset;
    record['subRecords'].push(subRecord);
  }

  callback(null, record);
}

export function writeRecord(
  record: Object,
  callback: (err: Error, result: Buffer) => void,
  context?: Object
) {
  try {
    if (typeof context === 'undefined') {
      // context is a way to persist values that are considered
      // elsewhere in parsing. Fields with the persist flag are added.
      // hopefully good enough
      context = {};
    }

    var results: Uint8Array[] = [];
    var write = (arr: Uint8Array) => results.push(arr); 

    writeFields(write, record, tes5.recordHeader, context);

    if (record['subRecords']) {
      for (let subRecord of record['subRecords']) {
        let hadXXXX = 'xxxxSize' in context;
        writeFields(write, subRecord, tes5.subRecordFields, context);
        if (hadXXXX) {
          delete context['xxxxSize'];
        }
      }
    }

    let length = results.reduce((sum, array) => sum + array.length, 0);
    let buffer = new Buffer(length);

    let offset = 0;
    for (let result of results) {
      buffer.set(result, offset);
      offset += result.length;
    }

    if (record['compressed']) {
      deflateRecordBuffer(buffer, (err, deflated) => {
        if (err) {
          callback(err, null);
        }
        else {
          callback(null, deflated);
        }
      }, record['compressionLevel']);
    }
    else {
      callback(null, buffer);
    }
  }
  catch (err) {
    callback(err, null);
  }
}
