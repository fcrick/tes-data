import * as fs from 'fs'
import * as crypto from 'crypto'

import * as tesData from '../src/index';

var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';
var outPath = (process.env.TEMP || '/tmp') + '/skyrimcopy.esm'

function rebuildFile(path: string, outFile: string) {
  var outFd = fs.openSync(outFile, 'w');
  var fd = fs.openSync(path, 'r');
  var context = {};

  var remaining = 0;
  var finished = 0;

  tesData.visit(fd, (offset, size, type, parent) => {
    remaining++;
    var buffer = new Buffer(size);
    fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
      tesData.readRecord(buffer, (err, record) => {
        tesData.writeRecord(record, (err, outBuffer) => {
          fs.write(outFd, outBuffer, 0, outBuffer.length, offset, (err, written, str) => {
            remaining--;
            finished++;

            if (finished % 10000 === 0) {
              console.log(`finished writing ${finished} records...`);
            }

            if (remaining === 0) {
              fs.closeSync(fd);
              fs.closeSync(outFd);
              getFileHash(path, hash => {
                getFileHash(outPath, otherHash => {
                  if (hash === otherHash) {
                    console.log(`Output file ${outPath} matches exactly!`);
                  }
                  else {
                    console.log(`Output file ${outPath} is not exactly the same - NOPOOOOOO!`);
                  }
                })
              })
            }
          });
        }, context);
      }, context);
    })
  }, err => {
    console.log("we're done!");
  });
}

function getFileHash(file: string, callback: (hash: string) => void) {
  var shasum = crypto.createHash('md5');
  var s = fs.createReadStream(file);
  s.on('data', d => shasum.update(d));
  s.on('end', () => callback(shasum.digest('hex')));
}

rebuildFile(path, outPath);
