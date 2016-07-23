export interface FieldOptions {
  size?: string|number;
  sizeOffset?: string|number;
  sizeDivideBy?: number;
  persist?: boolean;
  format?: 'hex';
  flag?: boolean;
  omitIfZero?: boolean;
}

export type FieldTypes = 'int32le'|'int16le'|'int8'|'uint32le'|'uint16le'|'uint8'|'char'|'float';

export type SimpleField = [string, FieldTypes];
export type SimpleFieldOpt = [string, FieldTypes, FieldOptions];
export type ConditionalFieldSet = [string, {[value:string]:FieldArray}];
export type ConditionalFieldSet2 = [string, {[value:string]:FieldArray}, FieldArray];
export type ConditionalFieldSet3 = [string, {[value:string]:FieldArray}, FieldArray, FieldOptions];
export type NestedFieldSet = [string, FieldArray];
export type NestedFieldSetOpt = [string, FieldArray, FieldOptions];
export type Field = SimpleField|SimpleFieldOpt|ConditionalFieldSet|ConditionalFieldSet2|ConditionalFieldSet3|NestedFieldSet|NestedFieldSetOpt;

// trick to make this being recursive not blow up
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
export interface FieldArray extends Array<Field> {}

// simple types that are used frequently on their own
export var unknown: FieldArray = [
  ['value', 'uint8', {size:'size', sizeOffset: 'xxxxSize'}]
];

export var uint16le: FieldArray = [
  ['value', 'uint16le']
];

export var uint32le: FieldArray = [
  ['value', 'uint32le']
];

export var int8: FieldArray = [
  ['value', 'int8']
];

export var float: FieldArray = [
  ['value', 'float']
];

export var uint8: FieldArray = [
  ['value', 'uint8']
];

// just 'string' on uesp docs
export var sString: FieldArray = [
  ['value', 'char', {size:'size'}],
];

export var wString: FieldArray = [
  ['valueSize', 'uint16le'],
  ['value', 'char', {size:'valueSize'}],
];

export var zString: FieldArray = [
  ['value', 'char', {size:-1}]
];

export var lString: FieldArray = [
  ['localized', { _true: uint32le }, zString],
];
