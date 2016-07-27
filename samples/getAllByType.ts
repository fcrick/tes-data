
var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';
var outDir = (process.env.TEMP || '/tmp') + '/byType';

import * as tesData from '../src/index';

var typeToGet = 'BPTD';

import * as fs from 'fs';

function getAllOfType(path: string, outDir: string, typeToGet: string) {
  var fd = fs.openSync(path, 'r');
  var context = {};

  var outFile = `${outDir}/${typeToGet}.json`;
  var outFd = fs.openSync(outFile, 'w');

  fs.writeSync(outFd, '[\n');

  var remaining = 1;

  var onDone = (err: Error) => {
    remaining--;
    if (remaining === 0) {
      fs.closeSync(fd);
      fs.writeSync(outFd, '\n]\n');
      fs.closeSync(outFd);
      console.log('finished!');
    }
  }

  tesData.visit(fd, (offset, size, type) => {
    if (type === typeToGet || type === 'TES4') {
      remaining++;
      var buffer = new Buffer(size);
      fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
        tesData.readRecord(buffer, (err, record) => {
          fs.write(outFd, JSON.stringify(record, null, 2) + ',\n', err => onDone(err));
        }, context);
      });
    }
  }, err => onDone(err));
}

getAllOfType(path, outDir, typeToGet);