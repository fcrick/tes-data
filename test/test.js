var assert = require('chai').assert;

describe('serious-calculations', () => {
  describe('another layer', () => {
    it('should be 2', () => {
      var two = 2;
      assert.isNumber(two);
      assert.equal(two, 2);
    });
  });
});