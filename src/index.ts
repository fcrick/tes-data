import * as records from './records';
import * as visitRecords from './visit-records'
import * as compression from './compression';

export const getSubrecordOffsets = records.getSubrecordOffsets;
export const readRecord = records.readRecord;
export const writeRecord = records.writeRecord;

export const visit = visitRecords.visit;

export const deflateRecordBuffer = compression.deflateRecordBuffer;
export const inflateRecordBuffer = compression.inflateRecordBuffer;