
var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';
var outDir = (process.env.TEMP || '/tmp') + '/byType';

import * as tesData from '../src/index';

var typeToGet = 'BPTD';

import * as fs from 'fs';

function getAllOfType(path: string, outDir: string, typeToGet: string) {
  var fd = fs.openSync(path, 'r');
  var context = {};

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  var outFile = `${outDir}/${typeToGet}.json`;
  var outFds: {[type: string]: number} = {};

  var remaining = 1;

  var onDone = (err: Error) => {
    remaining--;
    if (remaining === 0) {
      fs.closeSync(fd);
      for (var type in outFds) {
        fs.writeSync(outFds[type], '\n]\n');
        fs.closeSync(outFds[type]);
      }
      console.log('finished!');
    }
  }

  tesData.visit(fd, (offset, size, type) => {
    remaining++;
    if (!outFds[type]) {
      var outFile = `${outDir}/${type}.json`;
      outFds[type] = fs.openSync(outFile, 'w');
    }
    var buffer = new Buffer(size);
    fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
      tesData.readRecord(buffer, context)
        .then(record => {
          fs.write(outFds[type], JSON.stringify(record, null, 2) + ',\n', err => onDone(err));
        });
    });
  }, err => onDone(err));
}

getAllOfType(path, outDir, typeToGet);