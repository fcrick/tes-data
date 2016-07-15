### Installation

```
npm install tes-data --save
```

### Example

```js
import * as tesData from '@fcrick/tes-data';
import fs = require('fs');

var path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';

fs.open(path, 'r', (err, fd) => {
  tesData.getRecordOffsets(fd, 0, (err, offsetPairs) => {
    tesData.getRecordBuffer(fd, offsetPairs[0][0], (err, buffer) => {
      console.log(JSON.stringify(tesData.getRecord(buffer), null, 2));
      fs.close(fd);
    });
  });
});
```

output

```js
{
  "recordType": "TES4",
  "size": 44,
  "flags": 129,
  "version": 40,
  "subRecords": [
    {
      "type": "HEDR",
      "size": 12,
      "version": 0.9399999976158142,
      "numRecords": 920184,
      "nextObjectId": 3986
    },
    {
      "type": "CNAM",
      "size": 10,
      "value": "mcarofano"
    },
    {
      "type": "INTV",
      "size": 4,
      "value": 75461
    }
  ]
}
```