import test = require('tape')
import fs = require('fs');

import dump = require('../dump');

// interface TesData {
//   count(): number; // number of records
//   byteLength(): number; // size in bytes
// }

// declare module TesData {
//   function open(path: string): TesData;
// }

var TesData = dump.TESData;

// test('test test', t => {
  
//   fs.open('C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm', 'r',
//     (err: NodeJS.ErrnoException, fd: number) => {
//       fs.fstat(fd, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
//         dump.readRecord(fd, 0, r => {
//           console.log(JSON.stringify(r).substring(0, 60) + ' ...');
//           t.end();
//         });
//       });
//     }
//   );
// });

//test('how it should be', t => {
  
  // this should do very little
  var myData = TesData.open('C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm');
  
  // what do we now have? well, an ordered collection of records, representing the
  // contents of a single, potentially large binary file.

  // I think I want it to feel like a fully resolved collection, but internally, use
  // immutable state. I think this will let me expose mutations to users as if they
  // are immutable, returning a new object, but hide the mutating nature of read-only
  // operations behind an interface, so the fact that it's lazy isn't so apparent.

  // alternatively, I could more genuinely make the whole thing extremely lazy.
  
  // so, another concern I forgot about here is that a lot of the work done when
  // you're accessing this data is done async, meaning that the API needs to signal
  // that somehow.

  myData.count().then(c => console.log(c));
//});