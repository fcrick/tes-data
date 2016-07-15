import fs = require('fs');
import * as tesData from '../tes-data';
import * as recordTES5 from '../record-tes5';
import crypto = require('crypto');

var prefix = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/'
var paths = [
  'Skyrim.esm',
  'Update.esm',
  'Dawnguard.esm',
  'HearthFires.esm',
];

var subRecordMap: {[hash:string]: number} = {};
var uniqueCount = 0;
var totalSubRecords = 0;
var totalRecords = 0;
var duplicatedBytes = 0;
var mostFrequentCount = 0;
var mostFrequentAsHex = '';
var mostFrequentName = '';

function hashOffsets(buffer: Buffer, offsets: number[], minSize: number) {
  totalRecords += 1;
  if (totalRecords % 10000 === 0) {
    console.log(`totalRecords:${totalRecords}`);
  }
  offsets.forEach((offset, index, offsets) => {
    var endOffset = buffer.length;
    if (index + 1 < offsets.length)
      endOffset = offsets[index + 1];

    if (endOffset - offset < minSize)
      return;

    var digest = crypto.createHash('sha1').update(buffer.slice(offset, endOffset).toString('hex')).digest('hex');

    totalSubRecords += 1;
    if (totalSubRecords % 100000 === 0) {
      console.log(`totalSubRecords:${totalSubRecords}`);
    }

    var count:number;
    if (count = ++subRecordMap[digest]) {
      duplicatedBytes += endOffset - offset;
      mostFrequentCount = Math.max(count, mostFrequentCount);
      if (count === mostFrequentCount) {
        mostFrequentAsHex = buffer.slice(offset, endOffset).toString('hex');
        mostFrequentName = buffer.slice(offset, endOffset).toString('utf8',0,4);
      }
    }
    else {
      subRecordMap[digest] = 1;
      uniqueCount += 1
    }
  });
}

function hashOffsetsDone() {
  console.log(`uniqueCount:${uniqueCount}`);
  console.log(`totalSubRecords:${totalSubRecords}`);
  console.log(`duplicatedBytes:${duplicatedBytes}`);
  console.log(`mostFrequentCount:${mostFrequentCount}`);
  console.log(`mostFrequentAsHex:${mostFrequentAsHex}`);
  console.log(`mostFrequentLength:${mostFrequentAsHex.length/2}`)
  console.log(`mostFrequentName:${mostFrequentName}`);
}

function scan(onOffsets: (buffer: Buffer, offsets: number[]) => void, done: () => void) {
  var path = prefix + paths[0];
  var context = {};
  var seen = new Set<number>();

  fs.open(path, 'r', (err, fd) => {
    tesData.visit(fd, (offset, type) => {
      if (type === 'GRUP')
        return;

      if (seen.has(offset))
        return;
      seen.add(offset);

      tesData.getRecordBuffer(fd, offset, (err, buffer) => {
        onOffsets(buffer, recordTES5.getSubRecordOffsets(buffer));
      });
    }, () => done());
  });
}

scan((b,o) => hashOffsets(b, o, 0), hashOffsetsDone);