import * as recordTes5 from './record-types';
import * as tesData from './tes-data'
import * as compression from './compression';

export const getSubRecordOffsets = recordTes5.getSubRecordOffsets;
export const getRecord = recordTes5.getRecord;
export const writeRecord = recordTes5.writeRecord;

export const getRecordBuffer = tesData.getRecordBuffer;
export const visit = tesData.visit;

export const deflateRecordBuffer = compression.deflateRecordBuffer;
export const inflateRecordBuffer = compression.inflateRecordBuffer;