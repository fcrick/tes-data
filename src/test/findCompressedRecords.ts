import fs = require('fs');
import * as tesData from '../tes-data';
import * as recordTES5 from '../record-types';
import crypto = require('crypto');

var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';

function findCompressedRecords(path: string) {
  fs.open(path, 'r', (err, fd) => {
    var count = 0;
    var visitDone = false;
    var reads = 0;

    tesData.visit(fd, (offset, size, type, parent) => {
      var buffer = new Buffer(12);
      reads++;
      fs.read(fd, buffer, 0, 12, offset, (err, bytesRead, buffer) => {
        var type = buffer.toString('utf8', 0, 4);
        var flags = buffer.readUInt32LE(8);
        if (type !== 'GRUP' && flags & 0x40000 && count++ < 10) {
          tesData.getRecordBuffer(fd, offset, size, (err, buffer) => {
            recordTES5.getRecord(buffer, (err, record) => {
              console.log(JSON.stringify(record));
            });
          });
        }

        --reads;
        if (visitDone && reads === 0) {
          console.log(`total compressed: ${count}`);
        }
      });
    }, done => {
      visitDone = true;
      if (reads === 0) {
        console.log(`total compressed: ${count}`);
      }
    });
  });
}

findCompressedRecords(path);
