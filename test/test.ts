import { assert } from 'chai'
import * as tesData from '../src/index';
import * as crypto from 'crypto'

var recordJson = '{"recordType":"TES4","size":44,"flags":129,"version":40,"subRecords":[{"type":"HEDR","size":12,"version":0.9399999976158142,"numRecords":920184,"nextObjectId":3986},{"type":"CNAM","size":10,"value":"mcarofano"},{"type":"INTV","size":4,"value":75461}]}';
var recordBinary = Buffer.from('544553342C00000081000000000000000000000028000000484544520C00D7A3703F780A0E00920F0000434E414D0A006D6361726F66616E6F00494E54560400C5260100', 'hex');

describe('getRecord', () => {
  it('should match after conversion', done => {
    var record = JSON.parse(recordJson);

    tesData.writeRecord(record, (err, buffer) => {
      assert.isNull(err);
      assert.deepEqual(recordBinary, buffer);

      tesData.getRecord(buffer, (err, newRecord) => {
        assert.isNull(err);
        assert.deepEqual(newRecord, record);
        done();
      });
    });
  });
});

describe('validate inputs to writeRecord', () => {
  it('should error if record is not an object', done => {
    tesData.writeRecord(5, (err, result) => {
      assert.isNotNull(err);
      assert.isNull(result);
      done();
    });
  });
  it('should error if given random data', done => {
    tesData.writeRecord(crypto.randomBytes(50).toString('utf8'), (err, result) => {
      assert.isNotNull(err);
      assert.isNull(result);
      done();
    });
  });
});

describe('validate inputs to readRecord', () => {
  it('should error if give null', done => {
    tesData.getRecord(null, (err, result) => {
      assert.isNotNull(err);
      assert.isNull(result);
      done();
    });
  });
  it('should error if given an empty object', done => {
    tesData.getRecord(<Buffer>{}, (err, result) => {
      assert.isNotNull(err);
      assert.isNull(result);
      done();
    });
  });
  it('should give back a valid object on valid input', done => {
    tesData.getRecord(recordBinary, (err, result) => {
      assert.isNull(err);
      assert.isNotNull(result);
      done();
    });
  });
});

if (process.env.LARGE_FILES) {
  describe('this should not run on travis-ci', () => {
    it('should always fail', done => {
      assert.isNull(5);
      done();
    });
  });
}