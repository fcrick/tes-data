import { readFields, writeFields } from './fields'
import { deflateRecordBuffer, inflateRecordBuffer } from './compression'
import * as tes5 from './tes5/types'

/**
 * Finds where all the subrecords of a record begin, returning an array with the offset of each subrecord.
 * @param {Buffer} buffer An uncompressed buffer of a record that isn't a GRUP record.
 */
export function getSubrecordOffsets(buffer: Buffer) {
  var offsets: number[] = [];

  // read the header, as we need to know if it's compressed
  var record = {};
  readFields(record, buffer, 0, tes5.recordHeader, {});

  // don't support GRUP or compressed buffers - compressed records
  // should be uncompressed before this function is called
  if ('GRUP' === record['recordType'] || record['flags'] & 0x40000)
    return offsets;

  var offset = 24;
  while (offset < buffer.length) {
    offsets.push(offset);
    offset += 6 + buffer.readUInt16LE(offset + 4);
  } 

  return offsets;
}

/**
 * Reads a Skyrim record, firing a callback with the record as an object that can be serialized to json and back.
 * Supports compressed records.
 */
export async function readRecord(
  buffer: Buffer,
  context?: Object
): Promise<Object> {
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
    record['subrecords'] = [];
  }

  // localization flag check
  if (record['recordType'] === 'TES4' && record['flags'] & 0x80) {
    contextCopy['localized'] = true;
  }

  let {buffer: inflated, level} = await inflateRecordBuffer(buffer);
  if (level) {
    record['compressed'] = true;
    record['compressionLevel'] = level;
  }

  record = readSubrecords(inflated.slice(24), record, contextCopy);
  Object.keys(contextCopy).forEach(k => context[k] = contextCopy[k]);
  return record;
}

function readSubrecords(
  buffer: Buffer,
  record: Object,
  context: Object,
) {
  var offset = 0;

  // read subrecords
  while (offset < buffer.length) {
    var subrecord = {};

    // cheating a little here to simplify repeating records
    var subSize = buffer.readUInt16LE(offset + 4);
    var endOffset = offset + subSize + 6;

    if (context['xxxxSize']) {
      var hadXXXX = true;
      endOffset += context['xxxxSize'];
    }

    readFields(subrecord, buffer.slice(offset, endOffset), 0, tes5.subrecordFields, context);

    if (hadXXXX) {
      delete context['xxxxSize'];
      hadXXXX = false;
    }

    offset = endOffset;
    record['subrecords'].push(subrecord);
  }

  return record;
}

/**
 * Creates a binary buffer from a javascript object, reversing readRecord. Writing a read record should always create an
 * identical binary buffer.
 */
export async function writeRecord(record: Object, context?: Object) {
  if (typeof context === 'undefined') {
    // context is a way to persist values that are considered
    // elsewhere in parsing. Fields with the persist flag are added.
    // hopefully good enough
    context = {};
  }

  var results: Uint8Array[] = [];
  var write = (arr: Uint8Array) => results.push(arr); 

  writeFields(write, record, tes5.recordHeader, context);

  if (record['subrecords']) {
    for (let subrecord of record['subrecords']) {
      let hadXXXX = 'xxxxSize' in context;
      writeFields(write, subrecord, tes5.subrecordFields, context);
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
    return await deflateRecordBuffer(buffer, record['compressionLevel']);
  }
  else {
    return buffer;
  }
}
