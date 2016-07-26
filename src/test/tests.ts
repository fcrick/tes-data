import fs = require('fs');
import * as tesData from '../tes-data';
import * as recordTES5 from '../record-types';

var prefix = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/'
var paths = [
  'Skyrim.esm',
  // 'Update.esm',
  // 'Dawnguard.esm',
  // 'HearthFires.esm',
];

function loadOffsets() {
  paths.forEach(filename => {
    var path = prefix + filename;
    var log = filename + ' - find top records';

    console.time(log);
    fs.open(path, 'r', (err, fd) => {
      var count = 0;
      tesData.visit(fd, offset => { count++; }, err => {
        //console.log(logPrefix + JSON.stringify(result));
        console.timeEnd(log);
        console.log(count);
      }, 0, true);
    });
  });
}

function loadBuffers() {
  var path = prefix + paths[0];

  fs.open(path, 'r', (err, fd) => {
    tesData.visit(fd, (offset, size) => {
      var buffer = new Buffer(size);
      fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
        console.log(offset + ' is ' + buffer.length + ' bytes');
      })
    });
  });
}

var counter = 0;

var selectMany = (() => {
    var apply = Function.prototype.apply;
    var flatten = apply.bind(Array.prototype.concat, []);

    return (this_: any[], fn) => flatten(this_.map(fn));
})();

// var path = 'C:/src/skyrimmods/Brigandage v.4-32706-4/Brigandage.esp';
// var path = 'C:/src/skyrimmods/Immersive Armors v8-19733-8/Hothtrooper44_ArmorCompilation.esp';
var path = prefix + paths[0];
var mismatchCount = 0;
var allCount = 0;
var context: Object = {};

function checkBuffer(buffer: Buffer, offset: number, type: string) {
  if (mismatchCount >= 100) {
    return;
  }
  allCount += 1;
  var record = recordTES5.getRecord(buffer, (err, record) => {
    if (allCount % 10000 === 0) {
      console.log(allCount);
    }

    if (err) {
      console.log(err);
      return;
    }

    recordTES5.writeRecord(record, (err, newBuffer) => {
      var folder = '../test/data/';
      var offsetHex = offset.toString(16);
      var mismatch = buffer.compare(newBuffer) !== 0;

      if (mismatch) {
        console.log(`mismatch at ${offsetHex}`);

        fs.writeFile(`${folder}${offsetHex}_A.bin`, buffer);
        fs.writeFile(`${folder}${offsetHex}_B.bin`, newBuffer);

        mismatchCount += 1;
      }
      else {
        folder += offsetHex.substr(0, 2) + '/';
      }

      if (mismatch || allCount < 1000) {
        enqueueSave(folder, offsetHex, JSON.stringify(record, null, 2));
      }
    }, context);
  }, context);
}

var queue: [string, string, string][] = [];

function enqueueSave(folder: string, offsetHex: string, record: string) {
  queue.push([folder, offsetHex, record]);
  if (queue.length === 1) {
    doSave(folder, offsetHex, record);
  }
}

function doSave(folder: string, offsetHex: string, record: string) {
  fs.mkdir(folder, () => fs.writeFile(
    `${folder}${offsetHex}.json`,
    record,
    () => {
      queue.shift();
      if (queue.length > 0) {
        var next = queue[0];
        doSave(next[0], next[1], next[2]);
      }
    }
  ));
}

var seen = new Set<number>();

function visitOffset(offset: number, size: number, type: string, fd: number) {
  if (offset in seen) {
    return;
  }
  seen[offset] = true;

  var buffer = new Buffer(size);
  fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
    if (err) {
      console.log(err);
    }
    else {
      checkBuffer(buffer, offset, type)
    }
  });
}

function comparisonTest() {
  fs.open(path, 'r', (err, fd) => {
    tesData.visit(fd, (o, s, t) => visitOffset(o, s, t, fd));
  });
}

// loadOffsets();
// loadBuffers();
// readRecords();

comparisonTest();