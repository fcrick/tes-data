import fs = require('fs');
import * as tesData from '../tes-data';
import * as recordTES5 from '../record-tes5';

var prefix = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/'
var paths = [
  'Skyrim.esm',
  'Update.esm',
  'Dawnguard.esm',
  'HearthFires.esm',
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
      }, 0, false);
    });
  });
}

function loadBuffers() {
  var path = prefix + paths[0];

  fs.open(path, 'r', (err, fd) => {
    tesData.visit(fd, offset => {
      tesData.getRecordBuffer(path, offset, (err, buffer) => {
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

// TODO: get this working again
// function readRecords() {
//   var path = prefix + paths[0];

//   fs.open(path, 'r', (err, fd) => {
//     var printRecord: (err: NodeJS.ErrnoException, buffer: Buffer, loc: [number, string]) => void;
//     printRecord = (err, buffer, loc) => {
//       if (loc[1] === 'BPTD' && counter < 100000) {
//         var record = recordTES5.getRecord(buffer);
//         var edids = record.subRecords.filter(r => r.type === 'EDID');
//         var subs = record.subRecords.filter(r => r.type === 'RAGA');
//         var vmads = record.subRecords.filter(r => r.type === 'VMAD');
//         var scripts = selectMany(vmads, vmad => vmad['scripts'] || []);
//         var properties = selectMany(scripts, sc => sc['properties'] || []);
//         // if (properties.filter(p => [1,2,3,4,5].indexOf(p['propertyType']) === -1).length > 0) {
//         if (subs.length) {
//           counter += 1;
//           // console.log(loc[0]);

//           //if ((edids||[]).filter(edid => edid['value'] === 'FoodMammothMeat').length) {
//           (edids || []).forEach(sub => console.log(JSON.stringify(sub)));
//           // subs.forEach(sub => console.log(JSON.stringify(sub)));

//           // recordTES5.getRecord(buffer);
//           console.log(JSON.stringify(record, null, 2));
//         }
//       }
//       // else if (counter % 10000000 === 0) {
//       //   console.log(record);
//       // }
//     };
//     var handleOffset: (loc:[number, string]) => void;
//     handleOffset = loc => tesData.getRecordBuffer(fd, loc[0], (e,b) => printRecord(e, b, loc));
//     var handleOffsets: tesData.Callback<[[number,string][], number]>;
//     handleOffsets = (err, result) => {
//       var offsets = result[0];
//       // ignore the first entry as we should have already processed it
//       offsets = offsets.slice(1);
//       //console.log(JSON.stringify(offsets));
//       if (offsets) {
//         offsets.forEach(handleOffset);
//         offsets.map(o => o[0]).forEach(o => tesData.getRecordOffsets(fd, o, handleOffsets));
//       }
//     };
  
//     handleOffset([0, 'TES4']);
//     tesData.getRecordOffsets(fd, 0, handleOffsets);
//   });
// }

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
  var record = recordTES5.getRecord(buffer, context);
  var newBuffer = recordTES5.writeRecord(record, context);
  if (allCount % 10000 === 0) {
    console.log(allCount);
  }

  if (record['compressed']) {
    return;
  }

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

  if ((allCount <= 1000 || mismatch) && record['recordType'] !== 'GRUP') {
    enqueueSave(folder, offsetHex, JSON.stringify(record, null, 2));
  }
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

function visitOffset(offset: number, type: string, file: string|number) {
  if (offset in seen) {
    return;
  }
  seen[offset] = true;

  tesData.getRecordBuffer(file, offset, (e, b) => {
    if (e) {
      console.log(e);
      return;
    }
    checkBuffer(b, offset, type)
  });
}

function comparisonTest() {
  fs.open(path, 'r', (err, fd) => {
    tesData.visit(fd, (o, t) => visitOffset(o, t, fd));
  });
}

loadOffsets();
//loadBuffers();
//readRecords();

//comparisonTest();