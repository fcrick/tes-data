import * as fs from "async-file";

/**
 * Walks a file, starting at a given offset, calling onVisit for each record found. After onVisit is called on all
 * records, onDone is called. If onVisit ever returns false, the process is cancelled. Unless recurse is set to false,
 * when a group (GRUP) record is found, it's records will all also be visited, recursively, walking the tree heirarchy 
 * of the file. If an error is encountered, onDone is called with the error.
 * 
 * @export
 * @param {number} fd file handle like one returned by fs.open
 */
export function visit(
  fd: number,
  onVisit?: (offset: number, size: number, type?: string, parent?: number) => boolean|void,
  onDone?: (err?: NodeJS.ErrnoException) => void,
  startOffset?: number,
  recurse?: boolean
) {
  let outstanding = 0;
  let cancelled = false;
  startOffset = startOffset || 0;
  recurse = recurse || typeof recurse === 'undefined' ? true : false;

  var callback: (offset: number, size: number, type: string, parent: number) => boolean;
  callback = (offset, size, type, parent) => {
    if (offset !== parent || offset === startOffset) {
      cancelled = cancelled || <boolean>onVisit(offset, size, type, parent);
    }

    if (!cancelled && type === 'GRUP' && offset !== parent && recurse) {
      outstanding += 1;
      visitRecordOffsets(fd, offset, callback)
        .then(() => done(null)).catch(done);
    }

    return cancelled;
  }

  function done(err: NodeJS.ErrnoException) {
    outstanding -= 1;
    if ((err || outstanding === 0) && onDone) {
      onDone(err);

      // only report first error
      onDone = null;
    }
  }

  outstanding += 1;
  visitRecordOffsets(fd, startOffset, callback)
    .then(() => done(null)).catch(done);
}

/**
 * Walks a file, starting at a given offset, calling onVisit for each record found. After onVisit is called on all
 * records, onDone is called. If onVisit ever returns false, the process is cancelled. If an error is encountered,
 * onDone is called with the error.
 * 
 * Files represent a heirarchy. To walk this heirarchy recursively, use the visit function.
 * 
 * @param {number} fd file handle like one returned by fs.open
 */
async function visitRecordOffsets(
  fd: number,
  origOffset: number,
  onVisit: (offset: number, size: number, type: string, parent: number) => boolean
) {
  let endOffset = 0;

  if (!origOffset) {
    let stats = await fs.fstat(fd);

    if (stats.size == 0) {
      return;
    }
    else if (!origOffset) {
      // if origOffset isn't set, we're reading the whole file at the top level
      endOffset = stats.size;
    }
  }

  let buffer = new Buffer(8);
  while (nextOffset < endOffset) {
    let result = await fs.read(fd, buffer, 0, 8, origOffset);

    let offset = origOffset || 0;

    var nextOffset = offset + buffer.readUInt32LE(4);
    var type = buffer.toString('utf8', 0, 4);

    if (type !== 'GRUP') {
      nextOffset += 24;
    }
    else if (!endOffset) {
      // we just started reading a group, use its size to scope our scan
      endOffset = nextOffset;
      nextOffset = offset + 24;
    }

    // actual size of the record
    var size = type === 'GRUP' ? 24 : nextOffset - offset;

    // true return value means user is cancelling
    if (onVisit(offset, size, type, origOffset)) {
      return;
    }
  }
}
