import test = require('tape')
import fs = require('fs');

import tesData = require('../tes-data');

var prefix = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/'
var paths = [
  'Skyrim.esm',
  'Update.esm',
  'Dawnguard.esm',
  'HearthFires.esm',
];

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
