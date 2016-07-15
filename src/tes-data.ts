import fs = require('fs');

export interface Callback<T> {
  (err:NodeJS.ErrnoException, result: T): void;
}

interface FileContinuation<T> {
  (fd: number, callback: Callback<T>): void;
}

function loadRecordOffsets(fd: number, callback: Callback<[[number,string][], number]>, origOffset: number) {
  let offsets: [number,string][] = [];

  fs.fstat(fd, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
    if (err) {
      callback(err, null);
      return;
    }

    if (stats.size == 0) {
      callback(null, [offsets, origOffset]);
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
        var type = buffer.toString('utf8', 0, 4);
        offsets.push([offset, type]);
        if (type !== 'GRUP') {
          nextOffset += 24;
        }
        else if (!endOffset) {
          // we just started reading a group, use its size to scope our scan
          endOffset = nextOffset;
          nextOffset = offset + 24;
        }

        if (nextOffset < endOffset) {
          fs.read(fd, buffer, 0, 8, nextOffset, createRead(nextOffset));
        }
        else {
          callback(null, [offsets, origOffset]);
        }
      }

      var buffer = new Buffer(8);
      fs.read(fd, buffer, 0, 8, origOffset, createRead(origOffset));
    }
  });
}

function loadRecordBuffer(fd: number, callback: Callback<Buffer>, origOffset: number) {
  // first we need to check if this is a group or not, as group records have a fixed size
  var buffer = new Buffer(8);
  fs.read(fd, buffer, 0, 8, origOffset, (err, bytesRead, buffer) => {
    var type = buffer.toString('utf8', 0, 4);
    var size = type == 'GRUP' ? 24 : buffer.readUInt32LE(4) + 24

    var buffer = new Buffer(size);
    fs.read(fd, buffer, 0, size, origOffset, (err, bytesRead, buffer) => {
      callback(null, buffer);
    });
  });
  
}

function handlePathOrFd<T>(file: string | number, continuation: FileContinuation<T>, callback: Callback<T>) {
  var onOpen = (err: NodeJS.ErrnoException, fd: number) => {
    if (err) {
      callback(err, null);
      return;
    }

    var withClose: Callback<T> = (err, result) => {
      // make sure the file is closed if we opened it
      if (typeof fd === 'string') {
        fs.close(fd, err => err ? callback(err, null) : callback(null, result));
      }
      else {
        callback(null, result);
      }
    }

    continuation(fd, withClose);
  };

  if (typeof file === 'string') {
    fs.open(file, 'r', onOpen);
  }
  else if (typeof file === 'number') {
    onOpen(null, file);
  }
  else {
    callback({name:'BadArgument', message:'argument not a string or number'}, null);
  }
}

export function getRecordOffsets(file: string|number, origOffset: number, callback: Callback<[[number, string][], number]>) {
  // make a callback that embeds the arguments we're passing
  var continuation: FileContinuation<[[number,string][],number]> = (fd, callback) => loadRecordOffsets(fd, callback, origOffset);

  handlePathOrFd(file, continuation, callback);
}

export function getRecordBuffer(file: string|number, origOffset: number, callback: Callback<Buffer>) {
  // make a callback that embeds the arguments we're passing
  var continuation: FileContinuation<Buffer> = (fd, callback) => loadRecordBuffer(fd, callback, origOffset);

  handlePathOrFd(file, continuation, callback);
}

export interface VisitOptions {
  // alternative scan start location (default 0)
  origOffset?: number;

  // callbacks
  visitOffset?: (offset: number, type: string, parent: number) => void;
  done?: () => void;
}

export function visit(file: string|number, options: VisitOptions) {
  var origOffset = options.origOffset;
  if (typeof origOffset == 'undefined') {
    origOffset = 0;
  }

  var outstanding = 0;

  var callback: (err: NodeJS.ErrnoException, result: [[number, string][], number], first?: boolean) => void;
  callback = (err, result, first) => {
    if (err) {
      console.log(err);
      return;
    }

    var pairs = result[0];
    var parent = result[1];

    pairs.forEach((pair, index) => {
      // skip the initial offset unless this is the first call
      if (options.visitOffset && (first || index)) {
        options.visitOffset(pair[0], pair[1], parent);
      }

      // always skip the initial offset
      if (index) {
        outstanding += 1;
        getRecordOffsets(file, pair[0], callback);
      }
    });

    outstanding -= 1;
    if (outstanding === 0 && options.done) {
      options.done();
    }
  }

  outstanding += 1;
  getRecordOffsets(file, origOffset, (err, result) => callback(err, result, true));
}
