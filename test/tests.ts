import fs = require('fs');
import tesData = require('../tes-data');
import recordTES5 = require('../record-tes5');

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
    var logPrefix = filename + ' - ';

    console.time(logPrefix + 'find top records');
    tesData.getRecordOffsets(path, 0, (err: NodeJS.ErrnoException, offsets: [number,string][]) => {
      //console.log(logPrefix + JSON.stringify(offsets));
      console.timeEnd(logPrefix + 'find top records');
    });


    console.time(logPrefix + 'find all records');
    fs.open(path, 'r', (err, fd) => {
      var queue = [0];
      var seen = new Set<number>();

      var readFromQueue = () => {
        if (queue.length === 0) {
          fs.close(fd);
          console.log(logPrefix + seen.size + ' records total');
          console.timeEnd(logPrefix + 'find all records');
        }

        var nextSet = queue;
        queue = [];
        var remaining = nextSet.length;
        //console.log(logPrefix + "reading more entries:" + remaining);
        nextSet.forEach(next => {
          if (seen.has(next)) {
            console.log('seen');
            remaining -= 1;
            if (remaining == 0) {
              readFromQueue();
            }
          }
          else {
            seen.add(next);
            
            tesData.getRecordOffsets(fd, next, (err, offsets) => {
              // the first entry is always the offset you provided - remove it
              for (var offset of offsets.slice(1)) {
                queue.push(offset[0]);
              }

              remaining -= 1;
              if (remaining == 0) {
                readFromQueue();
              }
            });
          }
        });
      };

      readFromQueue();
    });
  });
}

function loadBuffers() {
  var path = prefix + paths[0];

  tesData.getRecordOffsets(path, 0, (err, offsets) => {
    offsets.forEach(offset => {
      tesData.getRecordBuffer(path, offset[0], (err, buffer) => {
        console.log(offset + ' is ' + buffer.length + ' bytes');
      })
    });
  });
}

var counter = 0;

function readRecords() {
  var path = prefix + paths[0];

  fs.open(path, 'r', (err, fd) => {
    var printRecord: (err: NodeJS.ErrnoException, buffer: Buffer, loc: [number, string]) => void;
    printRecord = (err, buffer, loc) => {
      if (loc[1] === 'ACHR' && counter < 2) {
        var record = recordTES5.getRecord(buffer);
        if (record.subRecords.filter(r => r.type === 'VMAD').length) {
          counter += 1;
          console.log(loc[0]);
          console.log(JSON.stringify(record, null, 2));
        }
      }
      // else if (counter % 10000000 === 0) {
      //   console.log(record);
      // }
    };
    var handleOffset: (loc:[number, string]) => void;
    handleOffset = loc => tesData.getRecordBuffer(fd, loc[0], (e,b) => printRecord(e, b, loc));
    var handleOffsets: tesData.Callback<[number,string][]>;
    handleOffsets = (err, offsets) => {
      // ignore the first entry as we should have already processed it
      offsets = offsets.slice(1);
      //console.log(JSON.stringify(offsets));
      if (offsets) {
        offsets.forEach(handleOffset);
        offsets.map(o => o[0]).forEach(o => tesData.getRecordOffsets(fd, o, handleOffsets));
      }
    };
  
    handleOffset([0, 'TES4']);
    tesData.getRecordOffsets(fd, 0, handleOffsets);
  });
}

//loadOffsets();
//loadBuffers();
readRecords();
