import test = require('tape')
import fs = require('fs');

import dump = require('../dump');

var TesData = dump.TESData;

var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';

TesData.getRecordOffsets(path, 0, (err: NodeJS.ErrnoException, offsets: number[]) => {
  console.log(JSON.stringify(offsets));
});