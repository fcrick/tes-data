import * as recordTes5 from './record-types';
import * as visitRecords from './visit-records'
import * as compression from './compression';

export const getSubrecordOffsets = recordTes5.getSubrecordOffsets;
export const getRecord = recordTes5.readRecord;
export const writeRecord = recordTes5.writeRecord;

export const visit = visitRecords.visit;

export const deflateRecordBuffer = compression.deflateRecordBuffer;
export const inflateRecordBuffer = compression.inflateRecordBuffer;