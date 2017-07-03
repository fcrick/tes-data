import { Field, FieldArray, FieldOptions, FieldTypes } from './common-types'

export function readFields(record: Object, buffer: Buffer, offset: number, fields: FieldArray, context: Object): number {
  if (!fields) {
    return offset;
  }

  for (var field of fields) {
    offset = readField(record, buffer, offset, field, context);
  }

  return offset;
}

export function writeFields(write: (arr: Uint8Array) => void, record: Object, fields: FieldArray, context: Object) {
  for (var field of fields) {
    writeField(write, record, field, context);
  }
}

function handleField<T>(
  field: Field,
  record: Object,
  context: Object,
  handleSimple: (name: string, type: FieldTypes, count: number, options: FieldOptions) => T,
  handleNesting: (name: string, fields: FieldArray, count:number) => T,
  handleCondition: (fields: FieldArray) => T,
  handleError: () => T
) {
  // control flow analysis will magically make this awesome someday
  let name = field[0];

  if (typeof field[1] === 'string') {
    let options = <FieldOptions>(field[2] || {});
    return handleSimple(name, <FieldTypes>field[1], getFieldCount(field, record, context), options);
  }
  else if (Array.isArray(field[1])) {
    return handleNesting(name, <FieldArray>field[1] || [], getFieldCount(field, record, context));
  }
  else if (typeof field[1] === 'object') {
    var valueMap = <{[type:string]:FieldArray}>field[1];
    var value = record[name];
    if (typeof value === 'undefined') {
      value = 0;
    }

    var fields = valueMap['_'+value];
    if (!fields) {
      var value = name in context ? context[name] : null;
      if (typeof value === 'undefined') {
        value = 0;
      }
      
      fields = valueMap['_'+value];
      if (!fields) {
        fields = <FieldArray>field[2];
      }
    }

    return handleCondition(fields || []);
  }

  return handleError();
}

function getFieldCount(field: Field, record: Object, context: Object): number {
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

    if (typeof options.sizeOffset === 'string') {
      var offsetCount = record[options.sizeOffset];
      if (typeof offsetCount === 'undefined') {
        offsetCount = context[options.sizeOffset];
        if (typeof offsetCount === 'undefined') {
          offsetCount = 0;
        }
      }
      count += offsetCount;
    }
    else if (typeof options.sizeOffset === 'number') {
      count += <number>options.sizeOffset;
    }

    if (typeof options.sizeDivideBy === 'number') {
      count /= options.sizeDivideBy;
    }
  }

  return count;
}

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

function readField(record: Object, buffer: Buffer, offset: number, field: Field, context: Object): number {
  return handleField<number>(field, record, context, (name, type, count, options) => {
    // simple

    // allow us to skip fields that would be omitted if they are zero, if
    // we're out of buffer.
    if (options.omitIfZero && offset >= buffer.length) {
      return offset;
    }

    var reader = fieldReaders[type];
    if (reader) {
      var value = null;

      // count is 0 means don't read anything
      if (count !== 0) {
        value = reader(buffer, type, offset, count);
      }

      if (options && options.persist) {
        context[name] = value;
      }

      if (value !== null) {
        if (options && options.format === 'hex') {
          if (typeof value === 'number') {
            value = '0x'+value.toString(16);
          }
          else if (typeof value === 'string') {
            value = value.split('').map(c => c.charCodeAt(0).toString(16)).join('');
          }
        }
        record[name] = value;
      }

      // count is -1 means the reader determined the count
      if (count === -1) {
        if (Array.isArray(value)) {
          count = value.length + 1;
        }
        else {
          count = 1
        }
      } 

      return offset + count * fieldSize[type];
    }
  }, (name, fields, count) => {
    // nested
    if (count) {
      record[name] = [];
      for (var i = 0; (i < count || count === -1) && offset < buffer.length; ++i) {
        var newRecord = {};
        record[name].push(newRecord);
        offset = readFields(newRecord, buffer, offset, <FieldArray>field[1], context);
      }
    }
    return offset;
  }, fields => {
    // condition resolve
    return fields ? readFields(record, buffer, offset, fields, context) : offset;
  }, () => {
    return offset;
  });
}

let range = function*(max: number) {
  for (let i = 0; i < max; i += 1)
    yield i
}

let isNegativeZero: (value: number) => boolean = require('is-negative-zero');

function nullIfZero(value: number) {
  return value === 0 && !isNegativeZero(value) ? null : value;  
}

function numericReader(
  bufferReader: (offset: number) => number,
  fieldType: FieldTypes,
  offset: number,
  count: number
): number|number[] {
  if (count === 1) {
    return nullIfZero(bufferReader(offset));
  }
  else {
    return [...range(count)].map(i => bufferReader(offset + i * fieldSize[fieldType]));
  }
}

function nullIfEqual<T>(value: T, test: T) {
  return value === test ? null : value;  
}

interface FieldReader {
  (buffer:Buffer, type: FieldTypes, offset:number, count: number): number|number[]|string;
}

var fieldReaders: {[fieldType:string]: FieldReader} = {
  char: (b,t,o,c) => {
    if (c === -1) {
      var all = b.toString('utf8', o, b.length);
      return all.substr(0, all.indexOf('\0'));
    }
    else {
      return nullIfEqual(b.toString('utf8', o, o+c), '');
    }
  },
  float: (b,t,o,c) => numericReader(b.readFloatLE.bind(b), t, o, c),
  int8: (b,t,o,c) => numericReader(b.readInt8.bind(b), t, o, c),
  int16le: (b,t,o,c) => numericReader(b.readInt16LE.bind(b), t, o, c),
  int32le: (b,t,o,c) => numericReader(b.readInt32LE.bind(b), t, o, c),
  uint8: (b,t,o,c) => numericReader(b.readUInt8.bind(b), t, o, c),
  uint16le: (b,t,o,c) => numericReader(b.readUInt16LE.bind(b), t, o, c),
  uint32le: (b,t,o,c) => numericReader(b.readUInt32LE.bind(b), t, o, c),
};

function writeField(write: (arr: Uint8Array) => void, record: Object, field: Field, context: Object) {
  handleField(field, record, context, (name, type, count, options) => {
    // simple
    var writer = fieldWriters[type];
    if (writer && (!options || !options.omitIfZero || record[name])) {
      writer(write, record, name, type, count);
    }

    if (options.persist) {
      context[name] = record[name];
    }
  }, (name, fields) => {
    // nested
    if (record[name]) {
      for (var entry of record[name]) {
        writeFields(write, entry, fields, context);
      }
    }
  }, fields => {
    // condition resolve
    writeFields(write, record, fields, context);
  }, () => {

  });
}

function numericWriter<T>(
  arrayType: { new (buffer: ArrayBuffer): T},
  write: (arr: Uint8Array) => void,
  record: Object,
  name: string,
  type: FieldTypes,
  count: number
) {
  var buffer = new ArrayBuffer(fieldSize[type] * count);
  var array = new arrayType(buffer);
  if (count === 1) {
    array[0] = name in record ? record[name] : 0;
  } else {
    for (var i of range(count)) {
      array[i] = record[name][i];
    }
  }
  write(new Uint8Array(buffer));
}

interface FieldWriter {
  (write: (arr: Uint8Array) => void, record: Object, name: string, type: FieldTypes, count: number): void;
}

import textEncoding = require('text-encoding');
var textEncoder = new textEncoding.TextEncoder();

var fieldWriters: {[fieldType:string]: FieldWriter} = {
  char: (write, record, name, type, count) => {
    write(textEncoder.encode(record[name]));

    if (count === -1) {
      write(new Uint8Array(1));
    }
  },
  float: (write, record, name, type, count) => numericWriter(Float32Array, write, record, name, type, count),
  int8: (write, record, name, type, count) => numericWriter(Int8Array, write, record, name, type, count),
  int16le: (write, record, name, type, count) => numericWriter(Int16Array, write, record, name, type, count),
  int32le: (write, record, name, type, count) => numericWriter(Int32Array, write, record, name, type, count),
  uint8: (write, record, name, type, count) => numericWriter(Uint8Array, write, record, name, type, count),
  uint16le: (write, record, name, type, count) => numericWriter(Uint16Array, write, record, name, type, count),
  uint32le: (write, record, name, type, count) => numericWriter(Uint32Array, write, record, name, type, count),
};

