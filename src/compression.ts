import * as zlib from 'zlib';

export type compressionLevel = 'none'|'fast'|'default'|'best';

export var compressionLevels: compressionLevel[] = [
  'none',
  'fast',
  'default',
  'best',
];

var levelMap = {
  'none': zlib.Z_NO_COMPRESSION,
  'fast': zlib.Z_BEST_SPEED,
  'default': zlib.Z_DEFAULT_COMPRESSION,
  'best': zlib.Z_BEST_COMPRESSION,
}

export function deflateRecordBuffer(
  buffer: Buffer,
  callback: (err: Error, result: Buffer) => void,
  level?: compressionLevel
) {
  // header is always 24 bytes
  var header = buffer.slice(0, 24);
  var toDeflate = buffer.slice(24); 

  var inflatedSize = toDeflate.length;
  zlib.deflate(toDeflate, {level: levelMap[level] || zlib.Z_DEFAULT_COMPRESSION}, (err, deflated: Buffer) => {
    if (err) {
      callback(err, null);
    }
    else {
      var outBuffer = new Buffer(24 + 4 + deflated.length);
      outBuffer.set(header, 0);
      outBuffer.writeUInt32LE(inflatedSize, header.length);
      outBuffer.set(deflated, header.length + 4);

      callback(null, outBuffer);
    }
  });
}

export function inflateRecordBuffer(
  buffer: Buffer,
  callback: (err: Error, result?: Buffer, level?: compressionLevel) => void
) {
  if (buffer.toString('utf8', 0,4) !== 'GRUP' && buffer.readUInt32LE(8) & 0x40000) {
    var level = compressionLevels[buffer.readUInt8(29) >> 6];
    var dataSize = buffer.readUInt32LE(24);
    var inflatedRecordBuffer = new Buffer(24 + dataSize);
    inflatedRecordBuffer.set(buffer, 24);

    zlib.inflate(
      buffer.slice(28),
      (err, inflated) => {
        if (err) {
          callback(err);
        }
        else {
          inflatedRecordBuffer.set(inflated, 24);
          callback(null, inflatedRecordBuffer, level);
        }
      }
    );
  }
}