import * as zlib from 'zlib';
import {promisify} from 'util';

type deflateFn = (buf: Buffer | string, options: zlib.ZlibOptions) => Promise<Buffer>;
const deflate = <deflateFn>promisify(zlib.deflate);

type inflateFn = (buf: Buffer) => Promise<Buffer>;
const inflate = <inflateFn>promisify(zlib.inflate);

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
  deflate(toDeflate, {level: levelMap[level] || zlib.Z_DEFAULT_COMPRESSION})
    .then((deflated: Buffer) => {
      var outBuffer = new Buffer(24 + 4 + deflated.length);
      outBuffer.set(header, 0);
      outBuffer.writeUInt32LE(inflatedSize, header.length);
      outBuffer.set(deflated, header.length + 4);

      callback(null, outBuffer);
    }).catch(err => callback(err, null));
}

export async function inflateRecordBuffer(buffer: Buffer) {
  var flags = buffer.readUInt32LE(8);
  if (buffer.toString('utf8', 0,4) !== 'GRUP' && flags & 0x40000) {
    var level = compressionLevels[buffer.readUInt8(29) >> 6];
    var dataSize = buffer.readUInt32LE(24);
    var inflatedRecordBuffer = new Buffer(24 + dataSize);
    buffer.copy(inflatedRecordBuffer, 0, 0, 24);

    let inflated = await inflate(buffer.slice(28));
    inflated.copy(inflatedRecordBuffer, 24, 0);
    inflatedRecordBuffer.writeInt32LE(flags & ~0x40000, 8);

    return {
      buffer: inflatedRecordBuffer,
      level: level,
    }
  }
  return {buffer: buffer, level: null};
}