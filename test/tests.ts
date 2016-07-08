import fs = require('fs');
import tesData = require('../tes-data');
import record = require('../record-tes5');

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
    tesData.getRecordOffsets(path, 0, (err: NodeJS.ErrnoException, offsets: number[]) => {
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
            remaining -= 1;
            if (remaining == 0) {
              readFromQueue();
            }
          }
          else {
            seen.add(next);
            
            tesData.getRecordOffsets(fd, next, (err, offsets) => {
              for (var offset of offsets) {
                queue.push(offset);
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
    // cause it's nice to get the first one, too
    offsets.unshift(0);
    
    offsets.forEach(offset => {
      tesData.getRecordBuffer(path, offset, (err, buffer) => {
        console.log(offset + ' is ' + buffer.length + ' bytes');
      })
    });
  });
}

function readRecords() {
  var path = prefix + paths[0];

  var printRecord = (err, buffer) => console.log(JSON.stringify(record.getRecord(buffer)));
  var handleOffset = offset => tesData.getRecordBuffer(path, offset, printRecord);
  var handleOffsets: tesData.Callback<number[]>;
  handleOffsets = (err, offsets) => {
    console.log(JSON.stringify(offsets));
    // cause it's nice to get the first one, too
    offsets.forEach(handleOffset);

    if (offsets.length > 1) {
      tesData.getRecordOffsets(path, offsets[offsets.length-1], handleOffsets);
      tesData.getRecordOffsets(path, offsets[offsets.length-2], handleOffsets);
    }
  };

  tesData.getRecordOffsets(path, 0, handleOffsets);
}

//loadOffsets();
//loadBuffers();
readRecords();