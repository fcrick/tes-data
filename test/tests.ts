import test = require('tape')
import fs = require('fs');

import dump = require('../dump');

test('test test', t => {
  
  fs.open('C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm', 'r',
    (err: NodeJS.ErrnoException, fd: number) => {
      fs.fstat(fd, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
        dump.readRecord(fd, 0, r => {
          console.log(JSON.stringify(r).substring(0, 60) + ' ...');

          

          t.end();
        });
      });
    }
  );
});