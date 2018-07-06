import { assert } from 'chai'
import * as tesData from '../src/index';
import * as crypto from 'crypto'
import * as fs from 'fs'
import { promisify } from 'util';

const openAsync = promisify(fs.open);
const closeAsync = promisify(fs.close);

var recordJson = '{"recordType":"TES4","size":44,"flags":129,"version":40,"subrecords":[{"type":"HEDR","size":12,"version":0.9399999976158142,"numRecords":920184,"nextObjectId":3986},{"type":"CNAM","size":10,"value":"mcarofano"},{"type":"INTV","size":4,"value":75461}]}';
var recordBinary = Buffer.from('544553342C00000081000000000000000000000028000000484544520C00D7A3703F780A0E00920F0000434E414D0A006D6361726F66616E6F00494E54560400C5260100', 'hex');

describe('getRecord', () => {
  it('should match after conversion', async done => {
    let err = null;
    let record = JSON.parse(recordJson);
    let newRecord = null;
    let buffer = null;

    try {
      buffer = await tesData.writeRecord(record);
      newRecord = await tesData.readRecord(buffer)
    } catch (e) {
      err = e;
    }
    
    assert.isNull(err);
    assert.deepEqual(recordBinary, buffer);
    assert.deepEqual(newRecord, record);
    done();
  });
});

// describe('visit', () => {
//   it('should error with an invalid file', done => {
//     var foundError = false;
//     var path = './test.tmp';
//     fs.writeFileSync(path, 'blah', {flag:'w'});
//     var fd = fs.openSync(path, 'r');
//     tesData.visit(fd, () => {}, err => {
//       if (err) {
//         foundError = true;
//       }
//     });
//     setTimeout(() => {
//       fs.unlinkSync(path);
//       assert.isTrue(foundError);
//       done();
//     }, 100);
//   });
// });

describe('validate inputs to writeRecord', () => {
  it('should error if record is not an object', async done => {
    let err = null;
    let result = null;
    try {
      result = await tesData.writeRecord(5);
    } catch (e) {
      err = e;
    }
    assert.isNotNull(err);
    assert.isNull(result);
    done();
  });
  it('should error if given random data', async done => {
    let err = null;
    let result = null;
    try {
      result = await tesData.writeRecord(crypto.randomBytes(50).toString('utf8'));
    } catch (e) {
      err = e;
    }
    assert.isNotNull(err);
    assert.isNull(result);
    done();
  });
});

describe('validate inputs to readRecord', () => {
  it('should error if give null', async done => {
    let err = null;
    let result = null;
    try {
      result = await tesData.readRecord(null);
    } catch(e) { 
      err = e;
    }
    assert.isNull(result);
    assert.isNotNull(err);
    done();
  });
  it('should error if given an empty object', async done => {
    let err = null;
    let result = null;
    try {
      result = await tesData.readRecord(<Buffer>{});
    } catch(e) { 
      err = e;
    }
    assert.isNull(result);
    assert.isNotNull(err);
    done();
  });
  it('should give back a valid object on valid input', async done => {
    let err = null;
    let result = null;
    try {
      result = await tesData.readRecord(recordBinary);
    } catch(e) { 
      err = e;
    }
    assert.isNull(err);
    assert.isNotNull(result);
    done();
  });
});

let path = 'C:/Program Files (x86)/Steam/steamapps/common/Skyrim/Data/Skyrim.esm';
if (fs.existsSync(path)) {
  describe('Verify some core stats about Skyrim.esm', () => {
    it('find all records', async function(done) {
      this.timeout(25000);

      let fd = await openAsync(path, 'r');

      var recordCount = 0;
      var uniqueParents = new Set<number>();
      var typeCount: {[type:string]: number} = {};

      tesData.visit(fd, (offset, size, type, parent) => {
        recordCount++;
        uniqueParents.add(parent);

        if (!(type in typeCount)) {
          typeCount[type] = 0;
        }
        typeCount[type]++;
      }, err => {
        assert.equal(920185, recordCount);
        assert.equal(49482, uniqueParents.size);
        assert.equal(120, Object.keys(typeCount).length);
        closeAsync(fd).then(done);
      });
    });
  });

  describe('Subrecords checks', () => {
    it('should have the correct number of subrecords', async function(done) {
      this.timeout(60000);

      var subrecordCount = 0;

      let fd = await openAsync(path, 'r');

      var outstanding = 1;

      var checkDone = () => {
        if (outstanding === 0) {
          assert.equal(4134046, subrecordCount);
          closeAsync(fd).then(done);
        }
      };
      
      tesData.visit(fd, (offset, size, type, parent) => {
        outstanding++;
        var buffer = new Buffer(size);
        fs.read(fd, buffer, 0, size, offset, (err, bytesRead, buffer) => {
          assert.isNull(err);
          assert.isNotNull(buffer);

          tesData.inflateRecordBuffer(buffer)
            .then(({buffer}) => {
              assert.isNotNull(buffer);

              subrecordCount += tesData.getSubrecordOffsets(buffer).length;
              --outstanding;
              checkDone();
            });
        });
      }, err => {
        assert.isNull(err);
        --outstanding;
        checkDone();
      });
    });
  });
}