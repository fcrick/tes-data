var assert = require('assert'),
    vows = require('vows');

vows.describe('serious-calculations').addBatch({
  'When performing serious calculations': {
    topic: 1 + 1,
    'result should be valid': function (result) {
      assert.isNumber(result);
      assert.equal(result, 2);
    }
  }
}).export(module);