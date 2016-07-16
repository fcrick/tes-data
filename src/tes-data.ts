import fs = require('fs');

export interface Callback<T> {
  (err:NodeJS.ErrnoException, result: T): void;
}

interface FileContinuation<T> {
  (fd: number, callback: Callback<T>): void;
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

export function getRecordBuffer(file: string|number, origOffset: number, callback: Callback<Buffer>) {
  // make a callback that embeds the arguments we're passing
  var continuation: FileContinuation<Buffer> = (fd, callback) => loadRecordBuffer(fd, callback, origOffset);

  handlePathOrFd(file, continuation, callback);
}

function visitRecordOffsets(
  fd: number,
  origOffset: number,
  visit: (offset: number, type: string, parent: number) => boolean,
  done: (err: NodeJS.ErrnoException) => void
) {
  let isDone = false;
  let endOffset = 0;

  let onFstat = (err: NodeJS.ErrnoException, stats: fs.Stats) => {
    if (err) {
      done(err);
      return;
    }

    if (stats.size == 0) {
      done(null);
    }
    else {
      // if origOffset isn't set, we're reading the whole file at the top level
      if (!origOffset) {
        endOffset = stats.size;
      }

      start();
    }
  };

  let start = () => {
    var buffer = new Buffer(8);
    fs.read(fd, buffer, 0, 8, origOffset, createRead(origOffset));
  }

  let createRead = (offset: number) => (err: NodeJS.ErrnoException, bytesRead: number, buffer: Buffer) => {
    offset = offset || 0;

    if (err) {
      done(err);
      isDone = true;
    }

    if (isDone) {
      return;
    }

    var nextOffset = offset + buffer.readUInt32LE(4);
    var type = buffer.toString('utf8', 0, 4);

    // true return value means user is cancelling
    if (visit(offset, type, origOffset)) {
      isDone = true;
      return;
    }

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
      done(null);
    }
  }

  // only need to fstat if it's the start of the file
  if (origOffset) {
    start();
  }
  else {
    fs.fstat(fd, onFstat);
  }
}

export function visit(
  fd: number,
  onVisit?: (offset: number, type?: string, parent?: number) => boolean|void,
  onDone?: (err?: NodeJS.ErrnoException) => void,
  startOffset?: number,
  recurse?: boolean
) {
  let outstanding = 0;
  let cancelled = false;
  startOffset = startOffset || 0;
  recurse = recurse || typeof recurse === 'undefined' ? true : false;

  var callback: (offset: number, type: string, parent: number) => boolean;
  callback = (offset, type, parent) => {
    if (offset !== parent || offset === startOffset) {
      cancelled = cancelled || <boolean>onVisit(offset, type, parent);
    }

    if (!cancelled && type === 'GRUP' && offset !== parent && recurse) {
      outstanding += 1;
      visitRecordOffsets(fd, offset, callback, done);
    }

    return cancelled;
  }

  function done(err: NodeJS.ErrnoException) {
    outstanding -= 1;
    if (err || outstanding === 0 && onDone) {
      onDone(err);

      // only report first error
      onDone = null;
    }
  }

  outstanding += 1;
  visitRecordOffsets(fd, startOffset, callback, done);
}
