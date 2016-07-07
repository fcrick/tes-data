// <reference path="typings/index.d.ts" />

import fs = require('fs');

interface Callback<T> {
  (err:NodeJS.ErrnoException, offsets: T): void;
}

interface FileContinuation<T> {
  (err: NodeJS.ErrnoException, fd: number, callback: Callback<T>): void;
}


function recordOffsets(err:NodeJS.ErrnoException, fd: number, callback: Callback<number[]>, origOffset: number) {
  // close the file if we finish without errors
  let success = (err: NodeJS.ErrnoException, offsets: number[]) => {
    // move this
    if (typeof fd === 'string') {
      fs.close(fd, (err: NodeJS.ErrnoException) => {
        if (err) {
          callback(err, null);
        }
        else {
          callback(null, offsets);
        }
      });
    }
    else {
      callback(null, offsets);
    }
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
}

function handlePathOrFd<T>(file: string | number, continuation: FileContinuation<T>, callback: Callback<T>) {
  var onOpen = (err: NodeJS.ErrnoException, fd: number) => {
    if (err) {
      continuation(err, null, callback);
    }

    var withClose: Callback<T> = (err, offsets) => {
      fs.close(fd);
      callback(err, offsets);
    }

    continuation(null, fd, callback);
  };

  if (typeof file === 'string') {
    fs.open(file, 'r', onOpen);
  }
  else if (typeof file === 'number') {
    onOpen(null, file);
  }
  else {
    continuation({name:'BadArgument', message:'argument not a string or number'}, null, callback);
  }
}

export function getRecordOffsets(file: string|number, origOffset: number, callback: Callback<number[]>) {
  // make a callback that embeds the arguments we're passing
  var continuation: FileContinuation<number[]> = (err, fd, callback) => recordOffsets(err, fd, callback, origOffset);

  handlePathOrFd(file, continuation, callback);
}

// export function parseRecord(file: string|number, origOffset: number, callback: (err:NodeJS.ErrnoException, offsets: number[]) => void) {

// }