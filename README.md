tes-data is a simple library for reading .esm and .esp files included in The Elder Scrolls and Fallout games. Written in TypeScript and published as a javascript npm module.

### Capabilities

* Given a file handle, get the offset in the file of every record in the file. The type and parent record are also provided.
* Given a file handle and record offset, get the contents of the record as an object.
* Given a file handle and record offset, get the offsets of every subrecord in the record.
* Given an object, generate the binary buffer representing that record.
* Supports compressed records, using zlib's inflate and deflate.
* At the commit of this writing, if every record in Skyrim.esm is turned into an object and back into a buffer, the result matches the original.
 
### Limitations

* Only contains type definitions for Skyrim files. Even these definitions aren't complete.
  * Incomplete definitions manifest as large arrays of 8 bit unsigned integers.
* Currently only tested against Skyrim files.
* Not yet tested in a browser, but would likely work with few changes.
* References between records are currently just numbers, and not resolved in any way.
* Only .esm/.esp files are supported, meaning localized strings can't yet be looked up.

### References

* Definition information primarily sourced from http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format, which is an excellent resource.
* https://github.com/TES5Edit/TES5Edit/blob/sharlikran-fo4dump/wbDefinitionsTES5.pas was also useful to help clarify when I was confused.

### Purpose

Created to provide a simple alternative to the Delphi implementation in xEdit, which is, well, in Delphi, requiring RAD Studio to compile. The cheapest edition of RAD Studio available retails on their site for $2450 USD. There is no free edition available other than a time-limited trial. The application is very tightly coupled to the Delphi ecosystem, and took me some time to compile, mostly due to the requirement that I build several IDE extensions the application depends on, and also, parts of the application were ported to assembly that doesn't function in the trial due to some compatibility issue. While I was able to get it all working, it seemed clear that there was a lot of unnecesary friction, and this library is a humble start to migrate away from Delphi-based tools.

### Main outstanding work items

The library still isn't really ready for consumption unless users are willing to tolerate some problems.  It's my hope to focus on improving the existing capability to correct this situation before moving on to other helpful building blocks.

* The library lacks proper tests, samples, and benchmarks.
* I've changed the exported API in essentially every recent update, and may continue to do so.
* While scanning for record offsets is actually quite fast, reading and writing records leaves room for a lot of improvement.
  * For example, on my local machine, locating all 920,185 records in Skyrim.esm, a 237 MB file, takes ~3.3 seconds.
* My hope is to provide an in-browser sample that demonstrates basic capabilities.

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
