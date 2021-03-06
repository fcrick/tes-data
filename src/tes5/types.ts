import {
  float,
  int8,
  int16le,
  int32le,
  lString,
  sString,
  uint8,
  uint16le,
  uint32le,
  unknown,
  wString,
  zString,
  FieldArray,
} from '../common-types'

// http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format
export var recordHeader: FieldArray = [
  ['recordType', 'char', {size:4,persist:true}],
  ['size','uint32le'],
  ['recordType', {_GRUP: [
    ['label', 'uint32le'],
    ['groupType', 'uint32le'],
    ['stamp', 'uint16le'],
    ['unknown1', 'uint16le'],
    ['version', 'uint16le', {persist:true}],
    ['unknown2', 'uint16le'],
  ]}, [
    ['flags','uint32le'],
    ['id','uint32le',{format:'hex'}],
    ['revision','uint32le'],
    ['version','uint16le', {persist:true}],
    ['unknown','uint16le'],
  ]],
];

// sets of fields referenced by other sets
var rgb: FieldArray = [
  ['r', 'uint8'],
  ['g', 'uint8'],
  ['b', 'uint8'],
  ['radiusPercent', 'uint8'],
];

var dayColors: FieldArray = [
  ['sunrise', rgb],
  ['day', rgb],
  ['sunset', rgb],
  ['night', rgb],
];

var xxxx: FieldArray = [
  ['xxxxSize', 'uint32le', {persist:true}],
];

// sets of fields for re-use
var atkd: FieldArray = [
  ['damageMult', 'float'],
  ['attackChance', 'float'],
  ['attackSpell', 'uint32le'],
  ['flags', 'uint32le'],
  ['attackAngle', 'float'],
  ['strikeAngle', 'float'],
  ['stagger', 'float'],
  ['attackType', 'uint32le'],
  ['knockdown', 'float'],
  ['recoveryTime', 'float'],
  ['fatigueMult', 'float'],
];

var bodt: FieldArray = [
  ['bodyPartFlags', 'uint32le'],
  ['flags', 'uint8'],
  ['unknown1', 'uint8'],
  ['unknown2', 'uint16le'],
  ['version', {_20: [], _21: []}, [
    ['skill', 'uint32le'],
  ]],
];

var bod2: FieldArray = [
  ['bodyPartFlags', 'uint32le'],
  ['skill', 'uint32le'],
];

var coed: FieldArray = [
  ['owner', 'uint32le'],
  ['value', 'uint32le'], // might be signed based on type owner refers to
  ['condition', 'float'],
];

var ctda: FieldArray = [
  ['operator', 'uint8'],
  ['unknown1', 'uint8'],
  ['unknown2', 'uint16le'],
  ['operator', {_4: [
    ['comparisonFormId', 'uint32le'],
  ]}, [
    ['comparisonValue', 'float'],
  ], {flag:true}], // unimplemented until i find an example
  ['functionIndex', 'uint16le'],
  ['unknown3', 'uint16le'],
  ['params', 'uint8', {size:'size', sizeOffset:-12}],
];

var dest: FieldArray = [
  ['health', 'uint32le'],
  ['count', 'uint8'],
  ['flag', 'uint8'],
  ['unknown1', 'uint8'],
  ['unknown2', 'uint8'],
];

var dodt: FieldArray = [
  ['minWidth', 'float'],
  ['maxWidth', 'float'],
  ['minHeight', 'float'],
  ['maxHeight', 'float'],
  ['depth', 'float'],
  ['shininess', 'float'],
  ['parallaxScale', 'float'],
  ['parallaxPasses', 'uint8'],
  ['flags', 'uint8'],
  ['unknown', 'uint16le'],
  ...rgb,
];

var dstd: FieldArray = [
  ['healthPercent', 'uint16le'],
  ['damageStage', 'uint8'],
  ['flags', 'uint8'],
  ['selfDamageRate', 'uint32le'],
  ['explosionId', 'uint32le'],
  ['debrisId', 'uint32le'],
  ['debrisCount', 'uint32le'],
];

var efit: FieldArray = [
  ['magnitude', 'float'],
  ['areaOfEffect', 'uint32le'],
  ['duration', 'uint32le'],
];

var goldAndWeight: FieldArray = [
  ['goldValue', 'uint32le'],
  ['weight', 'float'],
];

var ksiz: FieldArray = [['keywordCount', 'uint32le', {persist:true}]];
var kwda: FieldArray = [['keywords', 'uint32le', {size:'keywordCount'}]];

var lightning: FieldArray = [
  ['ambient', rgb],
  ['directional', rgb],
  ['fogNearColor', rgb],
  ['fogNear', 'float'],
  ['fogFar', 'float'],
  ['rotationXY', 'int32le'],
  ['rotationZ', 'int32le'],
  ['directionalFade', 'float'],
  ['fogClipDist', 'float'],
  ['fogPow', 'float'],
  ['ambientXPlus', rgb],
  ['ambientXMinus', rgb],
  ['ambientYPlus', rgb],
  ['ambientYMinus', rgb],
  ['ambientZPlus', rgb],
  ['ambientZMinus', rgb],
  // if the size is 64, stop here
  ['size', {_64: []}, [
    ['specularColor', rgb],
    ['fresnelPower', 'float'],
    ['size', {_72: []}, [
      ['fogFarColor', rgb],
      ['fogMax', 'float'],
      ['lightFadeDistancesStart', 'float'],
      ['lightFadeDistancesEnd', 'float'],
      ['flags', 'uint32le'],
    ]],
  ]],
];

var modt: FieldArray = [
  ['version', {
    _40: [
      ['count', 'uint32le'],
      ['unknown4count', 'uint32le'],
      ['unknown5count', 'uint32le'],
      ['unknown3', 'uint32le', {size:'count', sizeOffset:-2}],
      ['unknown4', [
        ['unknown1', 'uint32le'],
        ['textureType', 'char', {size:4}],
        ['unknown2', 'uint32le'],
      ], {size:'unknown4count'}],
      ['unknown5', 'uint32le', {size:'unknown5count'}],
    ],
  }, [
    ['entries', [
      ['unfdsfknown1', 'uint32le'],
      ['unknown2', 'char', {size:4}],
      ['unknown3', 'uint32le'],
    ], {size:-1}],
  ]],
];

var mods: FieldArray = [
  ['count', 'uint32le'],
  ['alternateTexture', [
    ['size', 'uint32le'],
    ['name', 'char', {size:'size'}],
    ['textureSet', 'uint32le'],
    ['index', 'uint32le'],
  ], {size:'count'}],
];

var obnd: FieldArray = [
  ['x1', 'int16le'],
  ['y1', 'int16le'],
  ['z1', 'int16le'],
  ['x2', 'int16le'],
  ['y2', 'int16le'],
  ['z2', 'int16le'],
];

var schr: FieldArray = [
  ['unknown1', 'uint32le'],
  ['refCount', 'uint32le'],
  ['compiledSize', 'uint32le'],
  ['variableCount', 'uint32le'],
  ['schrType', 'uint32le'],
];

var sped: FieldArray = [
  ['leftWalk', 'float'],
  ['leftRun', 'float'],
  ['rightWalk', 'float'],
  ['rightRun', 'float'],
  ['forwardWalk', 'float'],
  ['forwardRun', 'float'],
  ['backWalk', 'float'],
  ['backRun', 'float'],
  ['rotateInPlaceWalk', 'float'],
  ['rotateInPlaceRun', 'float'],
  ['size', {_40:[]}, [
    ['rotateWhileMovingRun', 'float'],
  ]],
];

// large subrecords that appear in multiple records
var scriptObject: FieldArray = [
  ['objFormat', {_1:[['formId','uint32le']]}], // prefix if objFormat is 1 (v1)
  ['alias', 'int16le'], // doc says this is unsigned in v2 but i think that's an error
  ['unused', 'uint16le'],
  ['objFormat', {_2:[['formId','uint32le']]}], // suffix in objFormat is 2 (v2)
];

var scriptBlock: FieldArray = [
  ['version', 'int16le'],
  ['objFormat', 'int16le', {persist:true}],
  ['scriptCount', 'uint16le'],
  ['scripts', [
    ['scriptNameSize', 'uint16le'],
    ['scriptName', 'char', {size:'scriptNameSize'}],
    ['status', 'uint8'],
    ['propertyCount', 'uint16le'],
    ['properties', [
      ['propertyNameSize', 'uint16le'],
      ['propertyName', 'char', {size:'propertyNameSize'}],
      ['propertyType', 'uint8'],
      ['status', 'uint8'],
      ['propertyType', {
        _1: scriptObject,
        _2: wString,
        _3: uint32le,
        _4: float,
        _5: int8,
        _11: [
          ['arraySize', 'uint32le'],
          ['arrayObject', scriptObject, {size: 'arraySize'}],
        ],
        _12: [
          ['arraySize', 'uint32le'],
          ['arrayString', wString, {size: 'arraySize'}],
        ],
        _13: [
          ['arraySize', 'uint32le'],
          ['arrayInt', 'int32le', {size: 'arraySize'}],
        ],
        _14: [
          ['arraySize', 'uint32le'],
          ['arrayFloat', 'float', {size: 'arraySize'}],
        ],
        _15: [
          ['arraySize', 'uint32le'],
          ['arrayBool', 'uint8', {size: 'arraySize'}],
        ],
      }],
    ], {size:'propertyCount'}],
  ], {size:'scriptCount'}]
];

var fragment: FieldArray = [
  ['unknown', 'int8'],
  ['scriptNameSize', 'uint16le'],
  ['scriptName', 'char', {size:'scriptNameSize'}],
  ['fragmentNameSize', 'uint16le'],
  ['fragmentName', 'char', {size:'fragmentNameSize'}],
];

var locationData: FieldArray = [
  ['x', 'float'],
  ['y', 'float'],
  ['z', 'float'],
  ['rX', 'float'],
  ['rY', 'float'],
  ['rZ', 'float'],
];

var vmad: FieldArray = [
  ...scriptBlock,
  ['recordType', {
    _INFO: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
        }],
      ]}],
    ],
    _PACK: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
          _4: [['fragments', fragment, {size:1}]],
          _5: [['fragments', fragment, {size:2}]],
          _6: [['fragments', fragment, {size:2}]],
          _7: [['fragments', fragment, {size:3}]],
        }],
      ]}],
    ],
    _PERK: [
      ['alwaysTwo', 'uint8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['fragmentCount', 'uint16le'],
        ['fragments', [
          ['index', 'uint16le'],
          ['unknown1', 'uint16le'],
          ...fragment,
        ], {size:'fragmentCount'}],
      ]}],
    ],
    _QUST: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['fragmentCount', 'uint16le'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['fragments', [
          ['index', 'uint16le'],
          ['unknown1', 'int16le'],
          ['logEntry', 'int32le'],
          ...fragment,
        ], {size:'fragmentCount'}],
        ['aliasCount', 'uint16le'],
        ['aliases', [
          ...scriptObject,
          ...scriptBlock,
        ], {size:'aliasCount'}],
      ]}],
    ],
    _SCEN: [
      ['alwaysTwo', 'int8', {omitIfZero:true}],
      ['alwaysTwo', {_2: [
        ['flags', 'uint8'],
        ['fileNameSize', 'uint16le'],
        ['fileName', 'char', {size:'fileNameSize'}],
        ['flags', {
          _1: [['fragments', fragment, {size:1}]],
          _2: [['fragments', fragment, {size:1}]],
          _3: [['fragments', fragment, {size:2}]],
        }],
        ['phaseCount', 'uint16le'],
        ['phases', [
          ['unknown1', 'int8'],
          ['phase', 'uint32le'],
          ...fragment,
        ], {size:'phaseCount'}],
      ]}],
    ],
  }],
];

var xapr: FieldArray = [
  ['formId', 'uint32le'],
  ['delay', 'float'],
];

var xesp: FieldArray = [
  ['parent', 'uint32le'],
  ['flags', 'uint32le'],
];

// record types
var aact: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: rgb,
}]];

var achr: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _NAME: uint32le,
  _XEZN: uint32le,
  _XPRD: float,
  _INAM: uint32le,
  _PDTO: [
    ['type', 'uint32le'],
    ['formId', 'uint32le'],
  ],
  _XRGD: unknown,
  _XRGB: unknown,
  _XLCM: uint32le,
  _XADP: uint8,
  _XAPR: xapr,
  _XLRT: uint32le,
  _XHOR: uint32le,
  _XESP: xesp,
  _XOWN: uint32le,
  _XLCN: uint32le,
  _XLKR: [['formIds', 'uint32le', {size:'size', sizeDivideBy: 4}]],
  _XLRL: uint32le,
  _XSCL: float,
  _DATA: locationData,
}, unknown]];

var acti: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _PNAM: rgb,
  _SNAM: uint32le,
  _VNAM: uint32le,
  _WNAM: uint32le,
  _RNAM: lString,
  _FNAM: uint16le,
  _KNAM: uint32le,
}]];

var addn: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _DATA: uint32le,
  _SNAM: uint32le,
  _DNAM: [
    ['particleCap', 'uint16le'],
    ['flags', 'uint16le'],
  ],
}]];

var alch: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _ICON: zString,
  _MICO: zString,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _DATA: float,
  _ENIT: [
    ['potionValue', 'uint32le'],
    ['flags', 'uint32le'],
    ['addiction', 'uint32le'],
    ['addictionChance', 'uint32le'],
    ['useSound', 'uint32le'],
  ],
  _EFID: uint32le,
  _EFIT: efit,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var ammo: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _ICON: zString,
  _MICO: zString,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _DESC: lString,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: [
    ['formId', 'uint32le'],
    ['flags', 'uint32le'],
    ['damage', 'float'],
    ['goldValue', 'uint32le'],
  ],
  _ONAM: sString,
}]];

var anio: FieldArray = [['type', {
  _EDID: zString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _BNAM: zString,
}]]

var appa: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _ICON: zString,
  _MICO: zString,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _QUAL: uint32le,
  _DESC: lString,
  _DATA: goldAndWeight,
}]];

var arma: FieldArray = [['type', {
  _EDID: zString,
  _BODT: bodt,
  _BOD2: bod2,
  _RNAM: uint32le,
  _DNAM: [
    ['male', 'uint8'],
    ['female', 'uint8'],
    ['unknown1', 'uint32le'],
    ['detection', 'uint8'],
    ['unknown2', 'uint8'],
    ['weaponAdjust', 'float'],
  ],
  _MOD2: zString,
  _MO2T: modt,
  _MO2S: mods,
  _MOD3: zString,
  _MO3T: modt,
  _MO3S: mods,
  _MOD4: zString,
  _MO4T: modt,
  _MO4S: mods,
  _MOD5: zString,
  _MO5T: modt,
  _MO5S: mods,
  _NAM0: uint32le,
  _NAM1: uint32le,
  _NAM2: uint32le,
  _NAM3: uint32le,
  _MODL: uint32le,
  _SNDD: uint32le,
  _ONAM: uint32le,
}]];

var armo: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _EITM: uint32le,
  _EAMT: uint16le,
  _MODT: modt,
  _MODS: mods,
  _MOD2: zString,
  _MO2T: modt,
  _MO2S: mods,
  _ICON: zString,
  _MICO: zString,
  _MOD4: zString,
  _MO4T: modt,
  _MO4S: mods,
  _ICO2: zString,
  _MIC2: zString,
  _BODT: bodt,
  _BOD2: bod2,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _BMCT: sString,
  _ETYP: uint32le,
  _BIDS: uint32le,
  _BAMT: uint32le,
  _RNAM: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DESC: lString,
  _MODL: uint32le,
  _DATA: goldAndWeight,
  _DNAM: uint32le,
  _TNAM: uint32le,
}]];

var arto: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DNAM: uint32le,
}]];

var aspc: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _SNAM: uint32le,
  _RDAT: uint32le,
  _BNAM: uint32le,
}]];

var astp: FieldArray = [['type', {
  _EDID: zString,
  _MPRT: zString,
  _FPRT: zString,
  _FCHT: zString,
  _MCHT: zString,
  _DATA: uint32le,
}]];

var avif: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _DESC: lString,
  _ANAM: zString,
  _CNAM: uint32le,
  _AVSK: [
    ['skillUseMult', 'float'],
    ['skillUseOffset', 'float'],
    ['skillImproveMult', 'float'],
    ['skillImproveOffset', 'float'],
  ],
  _PNAM: uint32le,
  _FNAM: uint32le,
  _XNAM: uint32le,
  _YNAM: uint32le,
  _HNAM: float,
  _VNAM: float,
  _SNAM: uint32le,
  _INAM: uint32le, 
}]];

var book: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _ICON: zString,
  _MICO: zString,
  _DESC: lString,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: [
    ['flags', 'uint8'],
    ['bookType', 'uint8'],
    ['unknown', 'uint16le'],
    ['teachFlags', 'uint32le'],
    ...goldAndWeight,
  ],
  _INAM: uint32le,
  _CNAM: lString,
}]];

var bptd: FieldArray = [['type', {
  _EDID: zString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _BPTN: lString,
  _BPNN: zString,
  _BPNT: zString,
  _BPNI: zString,
  _BPND: [
    ['damageMult', 'float'],
    ['flags', 'uint8'],
    ['partType', 'uint8'],
    ['healthPercent', 'uint8'],
    ['actorValue', 'int8'],
    ['toHitChance', 'uint8'],
    ['explodableChance', 'uint8'],
    ['explodableDebrisCount', 'uint16le'],
    ['explodableDebris', 'uint32le'],
    ['explodableExplosion', 'uint32le'],
    ['trackingMaxAngle', 'float'],
    ['explodableDebrisScale', 'float'],
    ['severableDebrisCount', 'int32le'],
    ['severableDebris', 'uint32le'],
    ['severableExplosion', 'uint32le'],
    ['severableDebrisScale', 'float'],
    ['tX', 'float'],
    ['tY', 'float'],
    ['tZ', 'float'],
    ['rX', 'float'],
    ['rY', 'float'],
    ['rZ', 'float'],
    ['severableImpactDataSet', 'uint32le'],
    ['explodableImpactDataSet', 'uint32le'],
    ['severableDecalCount', 'uint8'],
    ['explodableDecalCount', 'uint8'],
    ['unknown', 'uint16le'],
    ['limbReplacementScale', 'float'],
  ],
  _NAM1: zString,
  _NAM4: zString,
  _NAM5: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
  _RAGA: uint32le,
}]];

var cams: FieldArray = [['type', {
  _EDID: zString,
  _MODL: zString,
  _MODT: [['value', 'uint8', {size:12}]],
  _DATA: [
    ['action', 'uint32le'],
    ['location', 'uint32le'],
    ['target', 'uint32le'],
    ['flags', 'uint32le'],
    ['playerTimeMult', 'float'],
    ['targetTimeMult', 'float'],
    ['globalTimeMult', 'float'],
    ['maxTime', 'float'],
    ['minTime', 'float'],
    ['betweenPercent', 'float'],
    ['nearTargetDistance', 'float', {omitIfZero:true}],
  ],
  _MNAM: uint32le,
}]];

var cell: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _DATA: [['size', {
    _1: [['flags', 'uint8']],
    _2: [['flags', 'uint16le']],
  }]],
  _XCLC: [
    ['x', 'int32le'],
    ['y', 'int32le'],
    ['flags', 'uint32le'],
  ],
  _XCLL: lightning,
  _TVDT: unknown,
  _MHDT: unknown,
  _XCGD: unknown,
  _LTMP: uint32le,
  _LNAM: uint32le,
  _XCLW: float,
  _XNAM: uint8,
  _XCLR: [['value', 'uint32le', {size:'size',sizeDivideBy:4}]],
  _XLCN: uint32le,
  _XWCS: [['xwcuSize', 'uint32le', {persist:true}]],
  _XWCN: [['xwcuSize', 'uint32le', {persist:true}]],
  _XWCU: [['currents', [
    ['x', 'float'],
    ['y', 'float'],
    ['z', 'float'],
    ['unknown', 'float'],
  ], {size:'xwcuSize'}]],
  _XCWT: uint32le,
  _XOWN: uint32le,
  _XILL: uint32le,
  _XWEM: zString,
  _XCCM: uint32le,
  _XCAS: uint32le,
  _XEZN: uint32le,
  _XCMO: uint32le,
  _XCIM: uint32le,
}]];

var clas: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _DESC: lString,
  _ICON: zString,
  _DATA: [
    ['unknown', 'uint32le'],
    ['trainingSkill', 'uint8'],
    ['trainingLevel', 'uint8'],
    ['skillWeights', 'uint8', {size:18}],
    ['bleedoutDefault', 'float'],
    ['voicePoints', 'uint32le'],
    ['healthWeight', 'uint8'],
    ['magickaWeight', 'uint8'],
    ['staminaWeight', 'uint8'],
    ['flags', 'uint8'],
  ],
}]];

var clfm: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _CNAM: rgb,
  _FNAM: uint32le,
}]];

var clmt: FieldArray = [['type', {
  _EDID: zString,
  _WLST: [
    ['weather', 'uint32le'],
    ['percentChance', 'uint32le'],
    ['global', 'uint32le'],
  ],
  _FNAM: zString,
  _GNAM: zString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _TNAM: [
    ['sunriseBegin', 'uint8'],
    ['sunriseEnd', 'uint8'],
    ['sunsetBegin', 'uint8'],
    ['sunsetEnd', 'uint8'],
    ['volatility', 'uint8'],
    ['moons', 'uint8'],
  ],
}]];

var cobj: FieldArray = [['type', {
  _EDID: zString,
  _COCT: uint32le,
  _CNTO: [
    ['item', 'uint32le'],
    ['quantity', 'uint32le'],
  ],
  _COED: coed,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _CNAM: uint32le,
  _BNAM: uint32le,
  _NAM1: uint16le,
}]];

var coll: FieldArray = [['type', {
  _EDID: zString,
  _DESC: lString,
  _BNAM: uint32le,
  _FNAM: rgb,
  _GNAM: uint32le,
  _MNAM: zString,
  _INTV: uint32le,
  _CNAM: [['interactables', 'uint32le', {size:'size', sizeDivideBy: 4}]],
}]];

var cont: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _COCT: uint32le,
  _CNTO: [
    ['item', 'uint32le'],
    ['count', 'uint32le'],
  ],
  _COED: coed,
  _DATA: [
    ['flags', 'uint8'],
    ['weight', 'float'],
  ],
  _SNAM: uint32le,
  _QNAM: uint32le,
}]];

var cpth: FieldArray = [['type', {
  _EDID: zString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _ANAM: [
    ['parent', 'uint32le'],
    ['next', 'uint32le'],
  ],
  _DATA: uint8,
  _SNAM: uint32le,
}]];

var csty: FieldArray = [['type', {
  _EDID: zString,
  _CSGD: [
    ['offensiveMult', 'float'],
    ['defensiveMult', 'float'],
    ['size', {_8: []}, [
      ['groupOffensiveMult', 'float'],
      ['meleeEquipmentMult', 'float'],
      ['magicEquipmentMult', 'float'],
      ['rangedEquipmentMult', 'float'],
      ['shoutEquipmentMult', 'float'],
      ['unarmedMult', 'float'],
      ['size', {_32: []}, [
        ['staffEquipmentMult', 'float'],
        ['avoidThreatChance', 'float'],
      ]],
    ]],
  ],
  _CSMD: [
    ['unknown1', 'float'],
    ['unknown2', 'float'],
  ],
  _CSME: [
    ['attackStaggeredMult', 'float'],
    ['powerAttackStaggeredMult', 'float'],
    ['powerAttackBlockingMult', 'float'],
    ['bashMult', 'float'],
    ['bashRecoiledMult', 'float'],
    ['bashAttackMult', 'float'],
    ['bashPowerAttackMult', 'float'],
    ['size', {_28: []}, [
      ['specialAttackMult', 'float'],
    ]],
  ],
  _CSCR: [
    ['duelingCircleMult', 'float'],
    ['duelingFallbackMult', 'float'],
    ['size', {_8: []}, [
      ['flankDistance', 'float'],
      ['flankingStalkTime', 'float'],
    ]],
  ],
  _CSLR: float,
  _CSFL: [['various', 'float', {size:'size', sizeDivideBy:4}]],
  _DATA: uint32le,
}]];

var debr: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['percentage', 'uint8'],
    ['modelPath', 'char', {size:-1}],
    ['flags', 'uint8'],
  ],
  _MODT: modt,
}]];

var dial: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _PNAM: float,
  _BNAM: uint32le,
  _QNAM: uint32le,
  _DATA: [
    ['unknown1', 'uint8'],
    ['dialogTab', 'uint8'],
    ['subType', 'uint8'],
    ['unknown2', 'uint8'],
  ],
  _SNAM: [['value', 'char', {size:4}]],
  _TIFC: uint32le,
}]];

var dlbr: FieldArray = [['type', {
  _EDID: zString,
  _QNAM: uint32le,
  _TNAM: uint32le,
  _DNAM: uint32le,
  _SNAM: uint32le,
}]];

var dlvw: FieldArray = [['type', {
  _EDID: zString,
  _QNAM: uint32le,
  _BNAM: uint32le,
  _TNAM: uint32le,
  _ENAM: uint32le,
  _DNAM: uint8,
}]];

var dobj: FieldArray = [['type', {
  _DNAM: [['entries', [
    ['key', 'char', {size:4}],
    ['value', 'uint32le'],
  ], {size:-1}]],
}]];

var door: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _SNAM: uint32le,
  _ANAM: uint32le,
  _BNAM: uint32le,
  _FNAM: uint8,
}]];

var dual: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _DATA: [
    ['projectile', 'uint32le'],
    ['explosion', 'uint32le'],
    ['effectShader', 'uint32le'],
    ['hitEffectArt', 'uint32le'],
    ['impactDataSet', 'uint32le'],
    ['flags', 'uint32le'],
  ],
}]]

var eczn: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['owner', 'uint32le'],
    ['location', 'uint32le'],
    ['ownerRank', 'int8'],
    ['minLevel', 'uint8'],
    ['flags', 'uint8'],
    ['maxLevel', 'uint8'],
  ],
}]];

var efsh: FieldArray = [['type', {
  _EDID: zString,
  _ICON: zString,
  _ICO2: zString,
  _NAM7: zString,
  _NAM8: zString,
  _NAM9: zString,
  _DATA: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
}]];

var ench: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _ENIT: [
    ['cost', 'uint32le'],
    ['flags', 'uint32le'],
    ['castType', 'uint32le'],
    ['enchAmount', 'uint32le'],
    ['delivery', 'uint32le'],
    ['enchantType', 'uint32le'],
    ['chargeTime', 'float'],
    ['baseEnchantment', 'uint32le'],
    ['size', {_32:[]}, [
      ['wornRestrictions', 'uint32le'],
    ]],
  ],
  _EFID: uint32le,
  _EFIT: efit,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var equp: FieldArray = [['type', {
  _EDID: zString,
  _PNAM: [['slots', 'uint32le', {size:'size',sizeDivideBy:4}]],
  _DATA: uint32le,
}]];

var expl: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _EITM: uint32le,
  _MNAM: uint32le,
  _DATA: unknown,
}]];

var eyes: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _ICON: zString,
  _DATA: uint8,
}]];

var fact: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _XNAM: [
    ['faction', 'uint32le'],
    ['mod', 'int32le'],
    ['combat', 'uint32le'],
  ],
  _DATA: uint32le,
  _JAIL: uint32le,
  _WAIT: uint32le,
  _STOL: uint32le,
  _PLCN: uint32le,
  _CRGR: uint32le,
  _JOUT: uint32le,
  _CRVA: [
    ['arrest', 'uint8'],
    ['attackOnSight', 'uint8'],
    ['murder', 'uint16le'],
    ['assault', 'uint16le'],
    ['trespass', 'uint16le'],
    ['pickpocket', 'uint16le'],
    ['unknown', 'uint16le'],
    ['size', {_12:[]}, [
      ['stealMult', 'float'],
      ['size', {_16:[]}, [
        ['escape', 'uint16le'],
        ['werewolf', 'uint16le'],
      ]],
    ]],
  ],
  _RNAM: uint32le,
  _MNAM: lString,
  _FNAM: lString,
  _VEND: uint32le,
  _VENC: uint32le,
  _VENV: [
    ['startHour', 'uint16le'],
    ['endHour', 'uint16le'],
    ['radius', 'uint32le'],
    ['buysStolenItems', 'uint8'],
    ['notBuySell', 'uint8'],
    ['unknown', 'uint16le'],
  ],
  _PLVD: [
    ['valueType', 'uint32le'],
    ['value', 'uint32le'],
    ['unknown', 'uint32le'],
  ],
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var flor: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DEST: dest,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _PNAM: uint32le,
  _RNAM: lString,
  _FNAM: uint16le,
  _PFIG: uint32le,
  _SNAM: uint32le,
  _PFPC: [
    ['springPercent', 'uint8'],
    ['summerPercent', 'uint8'],
    ['fallPercent', 'uint8'],
    ['winterPercent', 'uint8'],
  ],
}]];

var flst: FieldArray = [['type', {
  _EDID: zString,
  _LNAM: uint32le,
}]];

var fstp: FieldArray = [['type', {
  _EDID: zString,
  _DATA: uint32le,
  _ANAM: zString,
}]];

var fsts: FieldArray = [['type', {
  _EDID: zString,
  _XCNT: [
    ['walking', 'uint32le'],
    ['running', 'uint32le'],
    ['sprinting', 'uint32le'],
    ['sneaking', 'uint32le'],
    ['swimming', 'uint32le'],
  ],
  _DATA: [['footsteps', 'uint32le', {size:'size', sizeDivideBy:4}]],
}]];

var furn: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DEST: dest,
  _DSTD: dstd,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _PNAM: uint32le,
  _FNAM: uint16le,
  _KNAM: uint32le,
  _MNAM: uint32le,
  _WBDT: [
    ['workbench', 'uint8'],
    ['actorValue', 'uint8'],
  ],
  _XMRK: zString,
  _NAM1: uint32le,
  _ENAM: uint32le,
  _NAM0: [
    ['unknown', 'uint16le'],
    ['flags', 'uint16le'],
  ],
  _FNMK: uint32le,
  _FNPR: [
    ['markerTypeFlags', 'uint16le'],
    ['markerEntryFlags', 'uint16le'],
  ],
}]];

var glob: FieldArray = [['type', {
  _EDID: zString,
  _FNAM: uint8,
  _FLTV: float,
}]];

var gmst: FieldArray = [['type', {
  _EDID: zString,
  _DATA: uint32le, // can be a float
}]];

var gras: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _DATA: [
    ['density', 'uint8'],
    ['minSlope', 'uint8'],
    ['maxSlope', 'uint8'],
    ['unknown1', 'uint8'],
    ['distanceFromWater', 'uint16le'],
    ['unknown2', 'uint16le'],
    ['howApplied', 'uint32le'],
    ['positionRange', 'float'],
    ['heightRange', 'float'],
    ['colorRange', 'float'],
    ['wavePeriod', 'float'],
    ['flags', 'uint32le'],
  ],
}]]

var hazd: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MNAM: uint32le,
  _DATA: [
    ['limit', 'uint32le'],
    ['radius', 'float'],
    ['lifetime', 'float'],
    ['isRadius', 'float'],
    ['targetInterval', 'float'],
    ['flags', 'uint32le'],
    ['spell', 'uint32le'],
    ['light', 'uint32le'],
    ['impactDataSet', 'uint32le'],
    ['sound', 'uint32le'],
  ],
}]];

var hdpt: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _DATA: uint8,
  _PNAM: uint32le,
  _HNAM: uint32le,
  _NAM0: uint32le,
  _NAM1: zString,
  _TNAM: uint32le,
  _RNAM: uint32le,
  _CNAM: uint32le,
}]];

var idle: FieldArray = [['type', {
  _EDID: zString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _DNAM: zString,
  _ENAM: zString,
  _ANAM: [
    ['parent', 'uint32le'],
    ['previous', 'uint32le'],
  ],
  _DATA: [
    ['minLoopingSeconds', 'uint8'],
    ['maxLoopingSeconds', 'uint8'],
    ['flags', 'uint8'],
    ['unknown', 'uint8'],
    ['replayDelay', 'uint16le'],
  ],
}]];

var idlm: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _IDLF: uint8,
  _IDLC: uint8,
  _IDLT: float,
  _IDLA: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
}]];

var imad: FieldArray = [['type', {
  _EDID: zString,
  _DNAM: [
    ['flags', 'uint32le'],
    ['duration', 'float'],
    ['times', 'uint32le', {size:'size', sizeOffset:-8, sizeDivideBy:4}],
  ],
  _TNAM: [['tintColors', [
    ['timestamp', 'float'],
    ['red', 'float'],
    ['green', 'float'],
    ['blue', 'float'],
    ['alpha', 'float'],
  ], {size:'size', sizeDivideBy:20}]],
  _NAM3: [['fadeColors', [
    ['timestamp', 'float'],
    ['red', 'float'],
    ['green', 'float'],
    ['blue', 'float'],
    ['alpha', 'float'],
  ], {size:'size', sizeDivideBy:20}]],
}, [
  ['value', 'float', {size:'size', sizeDivideBy:4}]
]]];

var imgs: FieldArray = [['type', {
  _EDID: zString,
  _ENAM: [
    ['eyeAdaptSpeed', 'float'],
    ['bloomBlurRadius', 'float'],
    ['bloomThreshold', 'float'],
    ['bloomScale', 'float'],
    ['receiveBloomThreshold', 'float'],
    ['sunlightScale', 'float'],
    ['skyScale', 'float'],
    ['saturation', 'float'],
    ['brightness', 'float'],
    ['contrast', 'float'],
    ['unknown', 'float', {size:4}],
  ],
  _HNAM: [
    ['eyeAdaptSpeed', 'float'],
    ['bloomBlurRadius', 'float'],
    ['bloomThreshold', 'float'],
    ['bloomScale', 'float'],
    ['receiveBloomThreshold', 'float'],
    ['white', 'float'],
    ['sunlightScale', 'float'],
    ['skyScale', 'float'],
    ['eyeAdaptStrength', 'float'],
  ],
  _CNAM: [
    ['saturation', 'float'],
    ['brightness', 'float'],
    ['contrast', 'float'],
  ],
  _TNAM: [
    ['tintAmount', 'float'],
    ['red', 'float'],
    ['green', 'float'],
    ['blue', 'float'],
  ],
  _DNAM: [
    ['strength', 'float'],
    ['distance', 'float'],
    ['range', 'float'],
    ['size', {_12:[]}, [
      ['unknown', 'float'],
    ]],
  ],
}]];

var info: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _DATA: [
    ['dialogueTab', 'uint16le'],
    ['flags', 'uint16le'],
    ['resetTime', 'float'],
  ],
  _ENAM: [
    ['flags', 'uint16le'],
    ['resetTime', 'uint16le'],
  ],
  _PNAM: uint32le,
  _CNAM: uint8,
  _TCLT: uint32le,
  _DNAM: uint32le,
  _TRDT: [
    ['emotionType', 'uint32le'],
    ['emotionValue', 'uint32le'],
    ['unknown1', 'int32le'],
    ['responseId', 'uint8'],
    ['unknown2', 'uint8', {size:3}],
    ['soundFile', 'uint32le'],
    ['useEmoAnim', 'uint8'],
    ['unknown3', 'uint8', {size:3}],
  ],
  _NAM1: lString,
  _NAM2: zString,
  _NAM3: zString,
  _SNAM: uint32le,
  _LNAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _SCHR: [
    ['unknown', 'uint32le'],
    ['refCount', 'uint32le'],
    ['compiledSize', 'uint32le'],
    ['variableCount', 'uint32le'],
    ['scriptType', 'uint32le'],
  ],
  _SCDA: unknown,
  _SCTX: sString,
  _QNAM: uint32le,
  _SCRO: uint32le,
  _RNAM: lString,
  _ANAM: uint32le,
  _TWAT: uint32le,
  _ONAM: uint32le,
}]];

var ingr: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _MODL: zString,
  _MODT: modt,
  _ICON: zString,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _DATA: goldAndWeight,
  _ENIT: [
    ['ingredientValue', 'uint32le'],
    ['flags', 'uint32le'],
  ],
  _EFID: uint32le,
  _EFIT: efit,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var ipct: FieldArray = [['type', {
  _EDID: zString,
  _MODL: zString,
  _MODT: modt,
  _DATA: [
    ['effectDuration', 'float'],
    ['flags', 'uint32le'],
    ['angleThreshold', 'float'],
    ['placementRadius', 'float'],
    ['soundLevel', 'uint32le'],
    ['unknown', 'uint32le'],
  ],
  _DODT: dodt,
  _DNAM: uint32le,
  _ENAM: uint32le,
  _SNAM: uint32le,
  _NAM1: uint32le,
  _NAM2: uint32le,
}]];

var ipds: FieldArray = [['type', {
  _EDID: zString,
  _PNAM: [
    ['material', 'uint32le'],
    ['impact', 'uint32le'],
  ],
}]];

var keym: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: goldAndWeight,
}]];

var kywd: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: rgb,
  _KSIZ: ksiz,
  _KWDA: kwda,
}]];

var land: FieldArray = [['type', {
  _ATXT: [
    ['texture', 'uint32le'],
    ['quadrant', 'uint8'],
    ['unknown', 'uint8'],
    ['layer', 'uint16le'], 
  ],
  _BTXT: [
    ['texture', 'uint32le'],
    ['quadrant', 'uint8'],
    ['unknown', 'uint8', {size:3}],
  ],
  _DATA: unknown,
  _VCLR: [
    ['colors', [
      ['r', 'uint8'],
      ['g', 'uint8'],
      ['b', 'uint8'],
    ], {size:1089}],
  ],
  _VHGT: [
    ['offset', 'float'],
    ['gradients', 'int8', {size:1089}],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint16le'],
  ],
  _VNML: [
    ['normals', [
      ['x', 'int8'],
      ['y', 'int8'],
      ['z', 'int8'],
    ], {size:1089}],
  ],
  _VTXT: unknown,
}]];

var lcrt: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: rgb,
}]];

var lctn: FieldArray = [['type', {
  _EDID: zString,
  _ACPR: [
    ['populations', [
      ['actor', 'uint32le'],
      ['cell', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy:12}],
  ],
  _LCPR: [
    ['populations', [
      ['actor', 'uint32le'],
      ['cell', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy:12}],
  ],
  _RCPR: [
    ['actors', 'uint32le', {size:'size', sizeDivideBy:4}],
  ],
  _ACUN: [
    ['actorRefs', [
      ['npc', 'uint32le'],
      ['actor', 'uint32le'],
      ['location', 'uint32le'],
    ], {size:'size', sizeDivideBy:12}],
  ],
  _LCUN: [
    ['actorRefs', [
      ['npc', 'uint32le'],
      ['actor', 'uint32le'],
      ['location', 'uint32le'],
    ], {size:'size', sizeDivideBy:12}],
  ],
  _ACSR: [
    ['staticRefs', [
      ['location', 'uint32le'],
      ['actor', 'uint32le'],
      ['cell', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy:16}],
  ],
  _LCSR: [
    ['staticRefs', [
      ['location', 'uint32le'],
      ['actor', 'uint32le'],
      ['cell', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy:16}],
  ],
  _ACEC: [
    ['world', 'uint32le'],
    ['unknown', 'uint16le', {size:'size', sizeOffset:-4, sizeDivideBy:2}],
  ],
  _LCEC: [
    ['world', 'uint32le'],
    ['unknown', 'uint16le', {size:'size', sizeOffset:-4, sizeDivideBy:2}],
  ],
  _ACEP: [
    ['enablePoints', [
      ['actor', 'uint32le'],
      ['reference', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy: 12}],
  ],
  _LCEP: [
    ['enablePoints', [
      ['actor', 'uint32le'],
      ['reference', 'uint32le'],
      ['unknown', 'uint32le'],
    ], {size:'size', sizeDivideBy: 12}],
  ],
  _ACID: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
  _LCID: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
  _FULL: lString,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _PNAM: uint32le,
  _NAM1: uint32le,
  _FNAM: uint32le,
  _MNAM: uint32le,
  _RNAM: float,
  _NAM0: uint32le,
  _CNAM: rgb,
}]];

var lgtm: FieldArray = [['type', {
  _EDID: zString,
  _DATA: lightning,
  _DALC: [
    ['ambientXPlus', rgb],
    ['ambientXMinus', rgb],
    ['ambientYPlus', rgb],
    ['ambientYMinus', rgb],
    ['ambientZPlus', rgb],
    ['ambientZMinus', rgb],
    ['size', {_24:[]}, [
      ['specularColor', rgb],
      ['fresnelPower', 'float'],
    ]],
  ],
}]];

var ligh: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _FULL: lString,
  _ICON: zString,
  _MICO: zString,
  _DATA: [
    ['time', 'int32le'],
    ['radius', 'uint32le'],
    ['color', rgb],
    ['flags', 'uint32le'],
    ['falloffExponent', 'float'],
    ['fov', 'float'],
    ['nearClip', 'float'],
    ['frequency', 'float'],
    ['intensityAmplitude', 'float'],
    ['movementAmplitude', 'float'],
    ...goldAndWeight,
  ],
  _FNAM: float,
  _SNAM: uint32le,
}]];

var lscr: FieldArray = [['type', {
  _EDID: zString,
  _DESC: lString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _NNAM: uint32le,
  _SNAM: float,
  _RNAM: [
    ['x', 'int16le'],
    ['y', 'int16le'],
    ['z', 'int16le'],
  ],
  _ONAM: [
    ['min', 'int16le'],
    ['max', 'int16le'],
  ],
  _XNAM: [
    ['x', 'float'],
    ['y', 'float'],
    ['z', 'float'],
  ],
  _MOD2: zString,
}]];

var ltex: FieldArray = [['type', {
  _EDID: zString,
  _TNAM: uint32le,
  _MNAM: uint32le,
  _HNAM: [
    ['friction', 'uint8'],
    ['restitution', 'uint8'],
  ],
  _SNAM: uint8,
  _GNAM: uint32le,
}]];

var lvli: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _LVLD: int8,
  _LVLF: int8,
  _LVLG: uint32le,
  _LLCT: int8,
  _LVLO: [
    ['level', 'uint32le'],
    ['item', 'uint32le'],
    ['count', 'uint32le'],
  ],
}]];

var lvln: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _LVLD: uint8,
  _LVLF: uint8,
  _LLCT: uint8,
  _LVLO: [
    ['level', 'uint32le'],
    ['item', 'uint32le'],
    ['count', 'uint32le'],
  ],
  _COED: coed,
  _MODL: zString,
  _MODT: modt,
}]];

var lvsp: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _LVLD: uint8,
  _LVLF: uint8,
  _LLCT: uint8,
  _LVLO: [
    ['level', 'uint32le'],
    ['spell', 'uint32le'],
    ['count', 'uint32le'],
  ],
}]]

var mato: FieldArray = [['type', {
  _EDID: zString,
  _MODL: zString,
  _DNAM: unknown,
  _DATA: [
    ['falloffScale', 'float'],
    ['falloffBias', 'float'],
    ['NoiseUVScale', 'float'],
    ['MaterialUVScale', 'float'],
    ['dirProjVectorX', 'float'],
    ['dirProjVectorY', 'float'],
    ['dirProjVectorZ', 'float'],
    ['size', {_28:[]}, [
      ['normalDampener', 'float'],
      ['size', {_32:[]}, [
        ['singlePassColorR', 'float'],
        ['singlePassColorG', 'float'],
        ['singlePassColorB', 'float'],
        ['singlePass', 'uint32le'],
      ]],
    ]],
  ],
}]];

var matt: FieldArray = [['type', {
  _EDID: zString,
  _MNAM: zString,
  _HNAM: uint32le,
  _PNAM: uint32le,
  _CNAM: [
    ['red', 'float'],
    ['green', 'float'],
    ['blue', 'float'],
  ],
  _BNAM: float,
  _FNAM: uint32le,
}]];

var mesg: FieldArray = [['type', {
  _EDID: zString,
  _DESC: lString,
  _FULL: lString,
  _INAM: uint32le,
  _QNAM: uint32le,
  _DNAM: uint32le,
  _TNAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _ITXT: lString,
}]];

var mgef: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _FULL: lString,
  _MDOB: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: [
    ['flags', 'uint32le'],
    ['baseCost', 'float'],
    ['relatedId', 'uint32le'],
    ['skill', 'int32le'],
    ['resistanceAV', 'uint32le'],
    ['unknown1', 'uint32le'],
    ['lightId', 'uint32le'],
    ['taperWeight', 'float'],
    ['hitShader', 'uint32le'],
    ['enchantShader', 'uint32le'],
    ['skillLevel', 'uint32le'],
    ['area', 'uint32le'],
    ['castingTime', 'float'],
    ['taperCurve', 'float'],
    ['taperDuration', 'float'],
    ['secondAVWeight', 'float'],
    ['effectType', 'uint32le'],
    ['primaryAV', 'int32le'],
    ['projectileId', 'uint32le'],
    ['explosionId', 'uint32le'],
    ['castType', 'uint32le'],
    ['deliveryType', 'uint32le'],
    ['secondAV', 'int32le'],
    ['castingArtId', 'uint32le'],
    ['hitEffectArtId', 'uint32le'],
    ['impactDataId', 'uint32le'],
    ['skillUsageMult', 'float'],
    ['dualCastId', 'uint32le'],
    ['dualCastScale', 'float'],
    ['enchantArtId', 'uint32le'],
    ['unknown2', 'uint32le'],
    ['unknown3', 'uint32le'],
    ['equipAbility', 'uint32le'],
    ['imageSpaceModId', 'uint32le'],
    ['perkId', 'uint32le'],
    ['soundVolume', 'uint32le'],
    ['scriptAIDataScore', 'float'],
    ['scriptAIDataDelayTime', 'float'],
  ],
  _ESCE: uint32le,
  _SNDD: [
    ['sounds', [
      ['soundType', 'uint32le'],
      ['soundDesc', 'uint32le'],
    ], {size:'size', sizeDivideBy: 8}],
  ],
  _DNAM: lString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var misc: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _ICON: zString,
  _MICO: zString,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: goldAndWeight,
}]];

var movt: FieldArray = [['type', {
  _EDID: zString,
  _MNAM: zString,
  _SPED: sped,
  _INAM: [
    ['directionalScale', 'float'],
    ['movementSpeedScale', 'float'],
    ['rotationSpeedScale', 'float'],
  ],
}]];

var mstt: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DATA: uint8,
  _SNAM: uint32le,
}]];

var musc: FieldArray = [['type', {
  _EDID: zString,
  _FNAM: uint32le,
  _PNAM: [
    ['priority', 'uint16le'],
    ['ducking', 'uint16le'],
  ],
  _WNAM: float,
  _TNAM: [['tracks', 'uint32le', {size:'size',sizeDivideBy:4}]],
}]];

var must: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: uint32le,
  _FLTV: float,
  _DNAM: float,
  _ANAM: zString,
  _BNAM: zString,
  _FNAM: [['cues', 'float', {size:'size',sizeDivideBy:4}]],
  _SNAM: [['tracks', 'uint32le', {size:'size',sizeDivideBy:4}]],
  _LNAM: [
    ['loopBegins', 'float'],
    ['loopEnds', 'float'],
    ['loopCount', 'uint32le'],
  ],
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var navi: FieldArray = [['type', {
  _EDID: zString,
  _NVER: uint32le,
  _NVMI: [
    ['navmesh', 'uint32le'],
    ['unknown1', 'uint32le'],
    ['x', 'float'],
    ['y', 'float'],
    ['z', 'float'],
    ['mergeFlags', 'uint32le'],
    ['mergeCount', 'uint32le'],
    ['mergedTo', 'uint32le', {size:'mergeCount'}],
    ['preferredCount', 'uint32le'],
    ['preferredMerges', 'uint32le', {size:'preferredCount'}],
    ['linkedDoors', 'uint32le'],
    ['doors', [
      ['unknown', 'uint32le'],
      ['door', 'uint32le'],
    ], {size:'linkedDoors'}],
    ['isIsland', 'uint8'],
    ['isIsland', {_0: []}, [
      ['minX', 'float'],
      ['minY', 'float'],
      ['minZ', 'float'],
      ['maxX', 'float'],
      ['maxY', 'float'],
      ['maxZ', 'float'],
      ['triangleCount', 'uint32le'],
      ['triangles', [
        ['indices', 'uint16le', {size:3}],
      ], {size:'triangleCount'}],
      ['vertexCount', 'uint32le'],
      ['vertices', [
        ['vertex', 'float', {size: 3}],
      ], {size:'vertexCount'}],
    ]],
    ['marker', 'uint32le'],
    ['worldSpace', 'uint32le'],
    ['worldSpace', {_60: [
      ['gridX', 'int16le'],
      ['gridY', 'int16le'],
    ]}, [
      ['cell', 'uint32le'],
    ]],
  ],
  _NVPP: [
    ['pathCount', 'uint32le'],
    ['paths', [
      ['formIdCount', 'uint32le'],
      ['pathFormId', 'uint32le', {size:'formIdCount'}],
    ], {size:'pathCount'}],
    ['indexSize', 'uint32le'],
    ['indices', [
      ['node', 'uint32le'],
      ['nodeIndex', 'uint32le'],
    ], {size: 'indexSize'}],
  ],
  _NVSI: [['navmeshes', 'uint32le', {size:'size', sizeDivideBy:4}]],
}]];

var navm: FieldArray = [['type', {
  _NVNM: unknown, // http://www.uesp.net/wiki/Tes5Mod:Mod_File_Format/NVNM_Field
  _ONAM: unknown,
  _PNAM: unknown,
  _NNAM: unknown,
  _XXXX: xxxx,
}, unknown]];

var npc_: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _ACBS: [
    ['flags', 'uint32le'],
    ['magickaOffset', 'uint16le'],
    ['staminaOffset', 'uint16le'],
    ['level', 'uint16le'],
    ['calcMinLevel', 'uint16le'],
    ['calcMaxLevel', 'uint16le'],
    ['speedMultiplier', 'uint16le'],
    ['dispositionBase', 'uint16le'],
    ['templateDataFlags', 'uint16le'],
    ['healthOffset', 'uint16le'],
    ['bleedoutOverride', 'uint16le'],
  ],
  _SNAM: [
    ['faction', 'uint32le'],
    ['rank', 'int8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint16le'],
  ],
  _INAM: uint32le,
  _VTCK: uint32le,
  _TPLT: uint32le,
  _RNAM: uint32le,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _SPCT: uint32le,
  _SPLO: uint32le,
  _WNAM: uint32le,
  _ANAM: uint32le,
  _ATKR: uint32le,
  _ATKD: atkd,
  _ATKE: zString,
  _SPOR: uint32le,
  _OCOR: uint32le,
  _GWOR: uint32le,
  _ECOR: uint32le,
  _PRKZ: uint32le,
  _PRKR: [
    ['perk', 'uint32le'],
    ['rank', 'uint8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint16le'],
  ],
  _COCT: uint32le,
  _CNTO: [
    ['item', 'uint32le'],
    ['count', 'uint32le'],
  ],
  _COED: coed,
  _AIDT: [
    ['aggression', 'uint8'],
    ['confidence', 'uint8'],
    ['energy', 'uint8'],
    ['morality', 'uint8'],
    ['mood', 'uint8'],
    ['assistance', 'uint8'],
    ['flags', 'uint8'],
    ['unknown', 'uint8'],
    ['warn', 'uint32le'],
    ['warnAttack', 'uint32le'],
    ['attack', 'uint32le'],
  ],
  _PKID: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _CNAM: uint32le,
  _FULL: lString,
  _SHRT: lString,
  _DATA: [],
  _DNAM: [
    ['oneHanded', 'uint8'],
    ['twoHanded', 'uint8'],
    ['marksman', 'uint8'],
    ['block', 'uint8'],
    ['smithing', 'uint8'],
    ['heavyArmor', 'uint8'],
    ['lightArmor', 'uint8'],
    ['pickpocket', 'uint8'],
    ['lockpicking', 'uint8'],
    ['sneak', 'uint8'],
    ['alchemy', 'uint8'],
    ['speechcraft', 'uint8'],
    ['alteration', 'uint8'],
    ['conjuration', 'uint8'],
    ['destruction', 'uint8'],
    ['illusion', 'uint8'],
    ['restoration', 'uint8'],
    ['enchanting', 'uint8'],
    ['modOneHanded', 'uint8'],
    ['modTwoHanded', 'uint8'],
    ['modMarksman', 'uint8'],
    ['modBlock', 'uint8'],
    ['modSmithing', 'uint8'],
    ['modHeavyArmor', 'uint8'],
    ['modLightArmor', 'uint8'],
    ['modPickpocket', 'uint8'],
    ['modLockpicking', 'uint8'],
    ['modSneak', 'uint8'],
    ['modAlchemy', 'uint8'],
    ['modSpeechcraft', 'uint8'],
    ['modAlteration', 'uint8'],
    ['modConjuration', 'uint8'],
    ['modDestruction', 'uint8'],
    ['modIllusion', 'uint8'],
    ['modRestoration', 'uint8'],
    ['modEnchanting', 'uint8'],
    ['calculatedHealth', 'uint16le'],
    ['calculatedMagicka', 'uint16le'],
    ['calculatedStamina', 'uint16le'],
    ['unknown1', 'uint16le'],
    ['farAwayModelDistance', 'float'],
    ['gearedUpWeapons', 'uint8'],
    ['unknown2', 'uint8'],
    ['unknown3', 'uint16le'],
  ],
  _PNAM: uint32le,
  _HCLF: uint32le,
  _ZNAM: uint32le,
  _GNAM: uint32le,
  _NAM5: int16le,
  _NAM6: float,
  _NAM7: float,
  _NAM8: uint32le,
  _CSDT: uint32le,
  _CSDI: uint32le,
  _CSDC: uint8,
  _CSCR: uint32le,
  _DOFT: uint32le,
  _SOFT: uint32le,
  _DPLT: uint32le,
  _CRIF: uint32le,
  _FTST: uint32le,
  _QNAM: [
    ['r', 'float'],
    ['g', 'float'],
    ['b', 'float'],
  ],
  _NAM9: [
    ['noseLongShort', 'float'],
    ['noseUpDown', 'float'],
    ['jawUpDown', 'float'],
    ['jawNarrowWide', 'float'],
    ['jawForwardBack', 'float'],
    ['cheeksUpDown', 'float'],
    ['cheeksForwardBack', 'float'],
    ['eyesUpDown', 'float'],
    ['eyesInOut', 'float'],
    ['browsUpDown', 'float'],
    ['browsInOut', 'float'],
    ['browsForwardBack', 'float'],
    ['lipsUpDown', 'float'],
    ['lipsInOut', 'float'],
    ['chinThinWide', 'float'],
    ['chinUpDown', 'float'],
    ['chinUnderbiteOverbite', 'float'],
    ['eyesForwardBack', 'float'],
    ['unknown', 'uint32le'],
  ],
  _NAMA: [
    ['nose', 'uint32le'],
    ['unknown', 'uint32le'],
    ['eyes', 'uint32le'],
    ['mouth', 'uint32le'],
  ],
  _TINI: uint16le,
  _TINC: rgb,
  _TINV: int32le,
  _TIAS: int16le,
}]];

var otft: FieldArray = [['type', {
  _EDID: zString,
  _INAM: [['value', 'uint32le', {size:'size', sizeDivideBy:4}]],
}]];

var pack: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _IDLC: uint8,
  _IDLA: [['idles', 'uint32le', {size:'size', sizeDivideBy:4}]],
  _IDLF: uint8,
  _IDLT: float,
  _QNAM: uint32le,
  _PKCU: [
    ['unknown1', 'uint32le'],
    ['packageTemplate', 'uint32le'],
    ['unknown2', 'uint32le'],
  ],
  _PKDT: [
    ['flags', 'uint32le'],
    ['packageType', 'uint8'],
    ['interruptOverride', 'uint8'],
    ['preferedSpeed', 'uint8'],
    ['unknown', 'uint8'],
    ['interruptFlags', 'uint32le'],
  ],
  _PSDT: [
    ['month', 'uint8'],
    ['dayOfWeek', 'uint8'],
    ['date', 'uint8'],
    ['hour', 'uint8'],
    ['minute', 'uint8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint16le'],
    ['duration', 'uint32le'],
  ],
  _ANAM: zString,
  _CNAM: unknown, // depends on ANAM subrecord
  _PDTO: [
    ['topicType', 'uint32le'],
    ['topicValue', 'uint32le'],
  ],
  _PLDT: [
    ['locationType', 'uint32le'],
    ['location', 'uint32le'],
    ['radius', 'uint32le'],
  ],
  _PTDA: [
    ['targetType', 'uint32le'],
    ['target', 'uint32le'],
    ['count', 'uint32le'],
  ],
  _TPIC: uint32le,
  _UNAM: uint8,
  _XNAM: int8,
  _PRCB: unknown,
  _PNAM: unknown, // zString _or_ uint32le gah
  _FNAM: uint32le,
  _PKC2: uint8,
  _PFO2: unknown,
  _PFOR: unknown,
  _BNAM: zString,
  _POBA: [],
  _POEA: [],
  _POCA: [],
  _INAM: uint32le,
  _SCHR: schr,
  _SCDA: unknown,
  _SCTX: sString,
  _SCRO: uint32le,
  _TNAM: int32le,
}]];

var perk: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _FULL: lString,
  _DESC: lString,
  _ICON: zString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  // _DATA: [
  //   ['isTrait', 'uint8'],
  //   ['level', 'uint8'],
  //   ['numRanks', 'uint8'],
  //   ['isPlayable', 'uint8'],
  //   ['isHidden', 'uint8'],
  // ],
  _DATA: unknown, // different based on section which we don't currently track
  _NNAM: uint32le,
  // _PRKE: [
  //   ['type', 'uint8'],
  //   ['rank', 'uint8'],
  //   ['priority', 'uint8'],
  // ],
  _PRKE: unknown,
  _PRKC: uint8,
  _EPFT: uint8,
  _EPF2: unknown,
  _EPF3: unknown,
  _EPFD: unknown,
  _PRKF: [],
}]];

var pgre: FieldArray = [['type', {
  _EDID: zString,
  _NAME: uint32le,
  _XIS2: [],
  _XSCL: float,
  _XESP: [
    ['value', 'uint32le'],
    ['flags', 'uint32le'],
  ],
  _XOWN: uint32le,
  _DATA: [
    ['x', 'float'],
    ['y', 'float'],
    ['z', 'float'],
    ['rX', 'float'],
    ['ry', 'float'],
    ['rZ', 'float'],
  ],
}]];

var phzd: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _NAME: uint32le,
  _XIS2: [],
  _XSCL: float,
  _XESP: [
    ['value', 'uint32le'],
    ['flags', 'uint32le'],
  ],
  _DATA: [
    ['x', 'float'],
    ['y', 'float'],
    ['z', 'float'],
    ['rX', 'float'],
    ['ry', 'float'],
    ['rZ', 'float'],
  ],
  _XLRL: uint32le,
}]];

var proj: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _DEST: dest,
  _DSTD: dstd,
  _NAM1: zString,
  _NAM2: unknown,
  _DATA: [
    ['flags', 'uint16le'],
    ['projectileType', 'uint16le'],
    ['gravity', 'float'],
    ['speed', 'float'],
    ['range', 'float'],
    ['light', 'uint32le'],
    ['muzzleFlashLight', 'uint32le'],
    ['tracerChance', 'float'],
    ['explosionProximity', 'float'],
    ['explosionTimer', 'float'],
    ['explosionType', 'uint32le'],
    ['soundRecord', 'uint32le'],
    ['muzzleDuration', 'float'],
    ['fadeDuration', 'float'],
    ['impactForce', 'float'],
    ['countdownSound', 'uint32le'],
    ['unknown', 'uint32le'],
    ['defaultWeaponSource', 'uint32le'],
    ['coneSpread', 'float'],
    ['collisionRadius', 'float'],
    ['lifetime', 'float'],
    ['relaunchInterval', 'float'],
    ['size', {_84:[]}, [
      ['decalData', 'uint32le'],
      ['size', {_88:[]}, [
        ['collisionLayer', 'uint32le'],
      ]],
    ]],
  ],
  _VNAM: uint32le,
}]];

var qust: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _FULL: lString,
  _DNAM: [
    ['flags', 'uint16le'],
    ['priority', 'uint8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint32le'],
    ['questType', 'uint32le'],
  ],
  _ENAM: [['value', 'char', {size:4}]],
  _QTGL: uint32le,
  _FLTR: zString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _NEXT: [],
  _INDX: [
    ['index', 'int16le'],
    ['flags', 'uint8'],
    ['unknown', 'uint8'],
  ],
  _QSDT: uint8,
  _CNAM: lString,
  _NAM0: uint32le,
  _SCHR: schr,
  _SCDA: unknown,
  _SCTX: sString,
  _QNAM: uint32le,
  _SCRO: uint32le,
  _QOBJ: int16le,
  _FNAM: uint32le,
  _NNAM: lString,
  _QSTA: [
    ['targetAlias', 'uint32le'],
    ['flags', 'uint32le'],
  ],
  _ANAM: uint32le,
  _ALST: uint32le,
  _ALLS: uint32le,
  _ALID: zString,
  _ALFI: uint32le,
  _ALCO: uint32le,
  _ALCA: uint32le,
  _ALCL: uint32le,
  _ALEQ: uint32le,
  _ALEA: uint32le,
  _ALFA: uint32le,
  _KNAM: uint32le,
  _ALRT: uint32le,
  _ALFE: [['value', 'char', {size:4}]],
  _ALFD: [['value', 'char', {size:4}]],
  _ALFL: uint32le,
  _ALFR: uint32le,
  _ALNA: uint32le,
  _ALNT: uint32le,
  _ALUA: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _COCT: uint32le,
  _CNTO: [['items', [
    ['itemId', 'uint32le'],
    ['itemCount', 'uint32le'],
  ], {size:'size', sizeDivideBy:8}]],
  _SPOR: uint32le,
  _OCOR: uint32le,
  _GWOR: uint32le,
  _ECOR: uint32le,
  _ALDN: uint32le,
  _ALSP: uint32le,
  _ALFC: uint32le,
  _ALPC: uint32le,
  _VTCK: uint32le,
  _ALED: [],
}]];

var race: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _DESC: lString,
  _SPCT: uint32le,
  _SPLO: uint32le,
  _WNAM: uint32le,
  _BODT: [
    ['bipedObjectFlags', 'uint32le'],
    ['generalFlags', 'uint32le'],
    ['armorType', 'uint32le'],
  ],
  _KSIZ: ksiz,
  _KWDA: kwda,
  _DATA: [
    ['racialBonus', [
      ['skill', 'uint8'],
      ['bonus', 'uint8'],
    ], {size:7}],
    ['padding', 'uint16le'],
    ['heightMale', 'float'],
    ['heightFemale', 'float'],
    ['weightMale', 'float'],
    ['weightFemale', 'float'],
    ['flags', 'uint32le'],
    ['health', 'float'],
    ['magicka', 'float'],
    ['stamina', 'float'],
    ['carryWeight', 'float'],
    ['mass', 'float'],
    ['accelerationRate', 'float'],
    ['decelerationRate', 'float'],
    ['raceSize', 'uint32le'],
    ['headBipedObject', 'uint32le'],
    ['hairBipedObject', 'uint32le'],
    ['injuredHealthProportion', 'float'],
    ['shieldBipedObject', 'uint32le'],
    ['healthRegen', 'float'],
    ['magickaRegen', 'float'],
    ['staminaRegen', 'float'],
    ['unarmedDamage', 'float'],
    ['unarmedReach', 'float'],
    ['bodyBipedObject', 'uint32le'],
    ['aimAngleTolerance', 'float'],
    ['unknown1', 'uint32le'],
    ['angularAccelerationRate', 'float'],
    ['angularTolerance', 'float'],
    ['flags2', 'uint32le'],
    ['size', {_128:[]},[
      ['unknown2', [['value', 'float']], {size:9}],
    ]],
  ],
  _MNAM: [],
  _ANAM: zString,
  _MODT: modt,
  _FNAM: [],
  _NAM2: [],
  _MTNM: [['value', 'char', {size:4}]],
  _VTCK: [['value', 'uint32le', {size:2}]],
  _DNAM: [['value', 'uint32le', {size:2}]],
  _HCLF: [['value', 'uint32le', {size:2}]],
  _TINL: uint16le,
  _PNAM: float,
  _UNAM: float,
  _ATKR: uint32le,
  _ATKD: atkd,
  _ATKE: zString,
  _NAM1: [],
  _INDX: uint32le,
  _MODL: zString,
  _GNAM: uint32le,
  _NAM3: [],
  _NAM4: uint32le,
  _NAM5: uint32le,
  _NAM7: uint32le,
  _ONAM: uint32le,
  _LNAM: uint32le,
  _NAME: zString,
  _MTYP: uint32le,
  _SPED: sped,
  _VNAM: uint32le,
  _QNAM: uint32le,
  _UNES: uint32le,
  _PHTN: zString,
  _PHWT: unknown, // known but todo
  _WKMV: uint32le,
  _RNMV: uint32le,
  _SWMV: uint32le,
  _FLMV: uint32le,
  _SNMV: uint32le,
  _SPMV: uint32le,
  _HEAD: uint32le,
  _MPAI: uint32le,
  _MPAV: [
    ['noseMorphFlags', 'uint32le'],
    ['unknown1', 'uint32le'],
    ['browMorphFlags', 'uint32le'],
    ['unknown2', 'uint32le',],
    ['eyeMorphFlags', 'uint32le'],
    ['eyeMorphFlags2', 'uint32le'],
    ['unknown3', 'uint32le'],
    ['lipMorphFlags', 'uint32le'],
  ],
  _RPRM: uint32le,
  _AHCM: uint32le,
  _FTSM: uint32le,
  _DFTM: uint32le,
  _TINI: uint16le,
  _TINT: zString,
  _TINP: uint16le,
  _TIND: uint32le,
  _TINC: uint32le,
  _TINV: float,
  _TIRS: uint16le,
  _RPRF: uint32le,
  _AHCF: uint32le,
  _FTSF: uint32le,
  _DFTF: uint32le,
  _NAM8: uint32le,
  _RNAM: uint32le,
}]];

var refr: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _NAME: uint32le,
  _XMBO: [['value', 'float', {size:3}]],
  _XPRM: [
    ...locationData,
    ['unknown1', 'float'],
    ['unknown2', 'uint32le'],
  ],
  _XPOD: [
    ['origin', 'uint32le'],
    ['dest', 'uint32le'],
  ],
  _XRMR: [
    ['xrmrCount', 'uint8', {persist:true}],
    ['flags', 'uint8', {size:3}],
  ],
  _LNAM: uint32le,
  _INAM: uint32le,
  _SCHR: schr,
  _SCDA: unknown,
  _SCTX: sString,
  _QNAM: uint32le,
  _SCRO: uint32le,
  _XLRM: uint32le,
  _XRDS: float,
  _XEMI: uint32le,
  _XLIG: [
    ['fovOffset', 'float'],
    ['fadeOffset', 'float'],
    ['endDistanceCap', 'float'],
    ['shadowDepthBias', 'float'],
  ],
  _XESP: xesp,
  _XALP: [
    ['currentAlphaCutoff', 'uint8'],
    ['defaultAlphaCutoff', 'uint8'],
  ],
  _XNDP: [
    ['navm', 'uint32le'],
    ['unknown', 'uint32le'],
  ],
  _XTEL: [
    ['destinationDoor', 'uint32le'],
    ...locationData,
    ['flags', 'uint32le'],
  ],
  _XSCL: float,
  _XAPD: uint8,
  _XAPR: xapr,
  _XLIB: uint32le,
  _XLOC: [
    ['level', 'int8'],
    ['unknown1', 'uint8', {size:3}],
    ['formId', 'uint32le'],
    ['flags', 'uint8'],
    ['unknown2', 'uint8', {size:11}],
  ],
  _XLRT: uint32le,
  _XOWN: uint32le,
  _XCNT: uint32le,
  _XCVL: [['value', 'float', {size:3}]],
  _XCVR: [['value', 'float', {size:3}]],
  _XEZN: uint32le,
  _XFVC: float,
  _FNAM: uint8,
  _FULL: lString,
  _TNAM: uint16le,
  _XHTW: float,
  _XLCM: uint32le,
  _XMBR: uint32le,
  _XPWR: uint32le,
  _XTRI: uint32le,
  _XACT: uint32le,
  _XATR: uint32le,
  _XWCN: uint32le,
  _XWCU: [['value', 'float', {size:'size',sizeDivideBy:4}]],
  _XPRD: float,
  _PDTO: [
    ['type', 'uint32le'],
    ['formId', 'uint32le'],
  ],
  _XLRL: uint32le,
  _DATA: locationData,
}, unknown]];

var regn: FieldArray = [['type', {
  _EDID: zString,
  _RCLR: rgb,
  _WNAM: uint32le,
  _RPLI: uint32le,
  _RPLD: [['value', 'float', {size:'size', sizeDivideBy: 4}]], // layout unknown
  _RDAT: [
    ['tab', 'uint32le'],
    ['flags', 'uint8'],
    ['priority', 'uint8'],
    ['unknown', 'uint16le'],
  ],
  _RDMO: uint32le,
  _RDSA: [['soundData', [
    ['sound', 'uint32le'],
    ['flags', 'uint32le'],
    ['chance', 'float'],
  ], {size:'size', sizeDivideBy: 12}]],
  _RDWT: [['weatherData', [
    ['weather', 'uint32le'],
    ['percentChance', 'uint32le'],
    ['global', 'uint32le'],
  ], {size:'size', sizeDivideBy: 12}]],
  _RDOT: [['soundData', [
    ['objectId', 'uint32le'],
    ['parentIndex', 'uint16le'],
    ['unknown1', 'uint16le'],
    ['density', 'float'],
    ['clustering', 'uint8'],
    ['minSlope', 'uint8'],
    ['maxSlope', 'uint8'],
    ['flags', 'uint8'],
    ['radiusWrtParent', 'uint16le'],
    ['radius', 'uint16le'],
    ['minHeight', 'float'],
    ['maxHeight', 'float'],
    ['sink', 'float'],
    ['sinkVariance', 'float'],
    ['sizeVariance', 'float'],
    ['angleVarianceX', 'uint16le'],
    ['angleVarianceY', 'uint16le'],
    ['angleVarianceZ', 'uint16le'],
    ['unknown2', 'uint16le'],
    ...rgb,
  ], {size:'size', sizeDivideBy: 52}]],
  _ICON: zString,
  _RDMP: lString,
}]];

var rela: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['parentNpc', 'uint32le'],
    ['childNpc', 'uint32le'],
    ['rank', 'uint16le'],
    ['flags', 'uint16le'],
    ['associatedType', 'uint32le'],
  ],
}]];

var revb: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['decayTime', 'uint16le'],
    ['hfReference', 'uint16le'],
    ['roomFilter', 'int8'],
    ['roomHfFilter', 'int8'],
    ['reflections', 'int8'],
    ['reverbAmp', 'int8'],
    ['decayHfRatio', 'uint8'],
    ['scaledReflectDelay', 'uint8'],
    ['reverbDelay', 'uint8'],
    ['diffusionPercent', 'uint8'],
    ['densityPercent', 'uint8'],
    ['unknown', 'uint8'],
  ],
}]];

var rfct: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['effectArt', 'uint32le'],
    ['shader', 'uint32le'],
    ['flags', 'uint32le'],
  ],
}]];

var scen: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _FNAM: uint32le,
  _HNAM: [],
  _NAM0: zString,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _SCHR: schr,
  _SCDA: unknown,
  _SCTX: sString,
  _QNAM: uint32le,
  _SCRO: uint32le,
  _NEXT: [],
  _WNAM: uint32le,
  _ALID: uint32le,
  _LNAM: uint32le,
  _DNAM: uint32le,
  _ANAM: unknown, // nothing or uint16le depending on context
  _INAM: uint32le,
  _SNAM: unknown, // float or uint32le depending on context
  _ENAM: uint32le,
  _DATA: uint32le,
  _HTID: int32le,
  _DMAX: float,
  _DMIN: float,
  _DEMO: uint32le,
  _DEVA: uint32le,
  _PNAM: uint32le,
  _VNAM: [
    ['setAllNormal', 'uint32le'],
    ['setAllPause', 'uint32le'],
    ['setAllEnd', 'uint32le'],
    ['dontSetAll', 'uint32le'],
  ],
  
}]];

var scrl: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _MDOB: uint32le,
  _ETYP: uint32le,
  _DESC: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _YNAM: uint32le,
  _ZNAM: uint32le,
  _DATA: goldAndWeight,
  _SPIT: [
    ['spellCost', 'uint32le'],
    ['flags', 'uint32le'],
    ['unknown1', 'uint32le'],
    ['chargeTime', 'float'],
    ['unknown2', 'uint32le'],
    ['targetType', 'uint32le'],
    ['unknown3', 'uint32le'],
    ['unknown4', 'uint32le'],
    ['unknown5', 'uint32le'],
  ],
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _EFID: uint32le,
  _EFIT: efit,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var shou: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _MDOB: uint32le,
  _DESC: lString,
  _SNAM: [
    ['word', 'uint32le'],
    ['spell', 'uint32le'],
    ['recoveryTime', 'float'],
  ],
}]];

var slgm: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _SOUL: uint8,
  _DATA: goldAndWeight,
  _SLCP: uint8,
  _NAM0: uint32le,
  _ZNAM: uint32le,
}]];

var smbn: FieldArray = [['type', {
  _EDID: zString,
  _PNAM: uint32le,
  _SNAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _DNAM: uint32le,
  _XNAM: uint32le, 
}]];

var smen: FieldArray = [['type', {
  _EDID: zString,
  _PNAM: uint32le,
  _SNAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _DNAM: uint32le,
  _XNAM: uint32le,
  _ENAM: uint32le,
}]];

var smqn: FieldArray = [['type', {
  _EDID: zString,
  _PNAM: uint32le,
  _SNAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _DNAM: uint32le,
  _XNAM: uint32le,
  _QNAM: uint32le,
  _MNAM: uint32le,
  _NNAM: uint32le,
  _RNAM: float,
}]];

var snct: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _FNAM: uint32le,
  _PNAM: uint32le,
  _VNAM: uint16le,
  _UNAM: uint16le,
}]];

var sndr: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: unknown,
  _GNAM: uint32le,
  _SNAM: uint32le,
  _FNAM: uint32le,
  _ANAM: zString,
  _ONAM: uint32le,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
  _LNAM: [
    ['flags', 'uint16le'],
    ['unknown', 'uint8'],
    ['rumble', 'uint8'],
  ],
  _BNAM: [
    ['freqShiftPercent', 'int8'],
    ['freqVariancePercent', 'uint8'],
    ['priority', 'uint8'],
    ['dbVariance', 'uint8'],
    ['staticAttenuation', 'uint16le'],
  ],
}]];

var sopm: FieldArray = [['type', {
  _EDID: zString,
  _NAM1: unknown,
  _FNAM: uint32le,
  _MNAM: uint32le,
  _CNAM: uint32le,
  _ONAM: unknown, // 24 uints - bounds of some kind, maybe
  _SNAM: unknown, // 16 uints
  _ANAM: [
    ['unknown1', 'uint32le'],
    ['unknown2', 'float'],
    ['unknown3', 'float'],
    ['unknown4', 'uint32le'],
    ['unknown5', 'uint32le'],
  ],
}]];

var soun: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FNAM: zString, // no longer used according to uesp
  _SNDD: unknown, // 36 bytes of who knows -- no longer used according to uesp
  _SDSC: uint32le,
}]];

var spel: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _FULL: lString,
  _MDOB: uint32le,
  _ETYP: uint32le,
  _DESC: lString,
  _SPIT: [
    ['spellCost', 'uint32le'],
    ['flags', 'uint32le'],
    ['spellType', 'uint32le'],
    ['chargeTime', 'float'],
    ['castType', 'uint32le'],
    ['delivery', 'uint32le'],
    ['castDuration', 'float'],
    ['range', 'float'],
    ['halfCostPerk', 'uint32le'],
  ],
  _EFID: uint32le,
  _EFIT: efit,
  _CTDA: ctda,
  _CITC: uint32le,
  _CIS1: zString,
  _CIS2: zString,
}]];

var spgd: FieldArray = [['type', {
  _EDID: zString,
  _DATA: [
    ['gravityVelocity', 'float'],
    ['rotationVelocity', 'float'],
    ['sizeX', 'float'],
    ['sizeY', 'float'],
    ['centerOffsetMin', 'float'],
    ['centerOffsetMax', 'float'],
    ['initialRotationRange', 'float'],
    ['subtextureCountX', 'uint32le'],
    ['subtextureCountY', 'uint32le'],
    ['shaderType', 'uint32le'],
    ['boxSize', 'uint32le', {omitIfZero:true}],
    ['particleDensity', 'float', {omitIfZero:true}],
  ],
  _ICON: zString,
}]];

var stat: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DNAM: [
    ['maxAngle', 'float'],
    ['directionalMaterial', uint32le],
  ],
  _MNAM: unknown,
}]];

var tact: FieldArray = [['type', {
  _EDID: zString,
  _VMAD: vmad,
  _OBND: obnd,
  _FULL: lString,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _DEST: dest,
  _DSTD: dstd,
  _DMDL: zString,
  _DMDT: modt,
  _DMDS: mods,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _PNAM: unknown,
  _SNAM: uint32le,
  _FNAM: unknown,
  _VNAM: uint32le,
}]];

var tree: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _PFIG: uint32le,
  _SNAM: uint32le,
  _PFPC: unknown,
  _FULL: lString,
  _CNAM: [
    ['trunkFlexibility', 'float'],
    ['branchFlexibility', 'float'],
    ['unknown1', 'float'],
    ['unknown2', 'float'],
    ['unknown3', 'float'],
    ['unknown4', 'float'],
    ['unknown5', 'float'],
    ['unknown6', 'float'],
    ['unknown7', 'float'],
    ['unknown8', 'float'],
    ['leafAmplitude', 'float'],
    ['leafFrequency', 'float'],
  ],
}]];

var txst: FieldArray = [['type', {
  _EDID: zString,
  _OBND: obnd,
  _TX00: zString,
  _TX01: zString,
  _TX02: zString,
  _TX03: zString,
  _TX04: zString,
  _TX05: zString,
  _TX06: zString,
  _TX07: zString,
  _DODT: dodt,
  _DNAM: uint16le,
}]];

var vtyp: FieldArray = [['type', {
  _EDID: zString,
  _DNAM: uint8,
}]];

var watr: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _ANAM: uint8,
  _FNAM: uint8,
  _MNAM: uint8,
  _XNAM: uint32le,
  _SNAM: uint32le,
  _INAM: uint32le,
  _TNAM: uint32le,
  _DATA: uint16le,
  _DNAM: [
    ['various', 'float', {size:57}], // fill these in some are known
  ],
  _GNAM: unknown,
  _NAM0: [
    ['linearVelocityX', 'float'],
    ['linearVelocityY', 'float'],
    ['linearVelocityZ', 'float'],
  ],
  _NAM1: [
    ['angularVelocityX', 'float'],
    ['angularVelocityY', 'float'],
    ['angularVelocityZ', 'float'],
  ],
  _NNAM: zString,
}]];

var weap: FieldArray = [['type', {
  _EDID: zString,
  _BAMT: uint32le,
  _BIDS: uint32le,
  _CNAM: uint32le,
  _CRDT: [
    ['criticalDamage', 'uint16le'],
    ['unused', 'uint16le'],
    ['criticalPercentMultiplier', 'float'],
    ['flags', 'uint32le'],
    ['criticalSpellEffect', 'uint32le'],
  ],
  _DATA: [
    ['value', 'uint32le'],
    ['weight', 'float'],
    ['damage', 'uint16le'],
  ],
  _DESC: lString,
  _DNAM: [
    ['animType', 'uint8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint16le'],
    ['speed', 'float'],
    ['reach', 'float'],
    ['flagsA', 'uint16le'],
    ['unknown3', 'uint16le'],
    ['sightFieldOfView', 'float'],
    ['unknown4', 'uint32le'],
    ['vatsToHit', 'uint8'],
    ['unknown5', 'int8'],
    ['projectileCount', 'uint8'],
    ['actorValue', 'int8'],
    ['minRange', 'float'],
    ['maxRange', 'float'],
    ['unknown6', 'uint32le'],
    ['flagsB', 'uint32le'],
    ['unknown7', 'float', {size:2}],
    ['rumbleLeft', 'float'],
    ['rumbleRight', 'float'],
    ['rumbleDuration', 'float'],
    ['unknown8', 'uint32le', {size:3}],
    ['skill', 'int32le'],
    ['unknown9', 'uint32le', {size:2}],
    ['resist', 'int32le'],
    ['unknown10', 'uint32le'],
    ['stagger', 'float'],
  ],
  _EAMT: uint16le,
  _EITM: uint32le,
  _ETYP: uint32le,
  _FULL: lString,
  _INAM: uint32le,
  _KSIZ: ksiz,
  _KWDA: kwda,
  _OBND: obnd,
  _MODL: zString,
  _MODT: modt,
  _MODS: mods,
  _NAM7: uint32le,
  _NAM8: uint32le,
  _NAM9: uint32le,
  _NNAM: zString,
  _SNAM: uint32le,
  _TNAM: uint32le,
  _UNAM: uint32le,
  _VMAD: vmad,
  _VNAM: uint32le,
  _WNAM: uint32le,
  _XNAM: uint32le,
  _YNAM: uint32le,
  _ZNAM: uint32le,
}]];

var woop: FieldArray = [['type', {
  _EDID: zString,
  _FULL: lString,
  _TNAM: lString,
}]];

var wrld: FieldArray = [['type', {
  _EDID: zString,
}]];



var wthr: FieldArray = [['type', {
  _EDID: zString,
  _00TX: zString,
  _10TX: zString,
  _20TX: zString,
  _30TX: zString,
  _40TX: zString,
  _50TX: zString,
  _60TX: zString,
  _70TX: zString,
  _80TX: zString,
  _90TX: zString,
  '_\x3c0TX': zString,
  '_\x3d0TX': zString,
  '_\x3e0TX': zString,
  '_\x3f0TX': zString,
  '_@0TX': zString,
  '_:0TX': zString,
  '_;0TX': zString,
  _A0TX: zString,
  _B0TX: zString,
  _C0TX: zString,
  _D0TX: zString,
  _E0TX: zString,
  _F0TX: zString,
  _G0TX: zString,
  _H0TX: zString,
  _I0TX: zString,
  _J0TX: zString,
  _K0TX: zString,
  _L0TX: zString,
  _LNAM: uint32le,
  _MNAM: uint32le,
  _NNAM: uint32le,
  _RNAM: [
    ['cloudSpeedY', 'uint8', {size:32}],
  ],
  _QNAM: [
    ['cloudSpeedY', 'uint8', {size:32}],
  ],
  _PNAM: [['cloudTextureColor', dayColors, {size:32}]],
  _JNAM: [['cloudTextureAlpha', dayColors, {size:32}]],
  _NAM0: [['textureColors', dayColors, {size:'size', sizeDivideBy:16}]],
  _FNAM: [
    ['dayNear', 'float'],
    ['dayFar', 'float'],
    ['nightNear', 'float'],
    ['nightFar', 'float'],
    ['dayPow', 'float'],
    ['nightPow', 'float'],
    ['dayMax', 'float'],
    ['nightMax', 'float'],
  ],
  _DATA: [
    ['windSpeed', 'uint8'],
    ['unknown1', 'uint8'],
    ['unknown2', 'uint8'],
    ['transDelta', 'uint8'],
    ['sunGlare', 'uint8'],
    ['sunDamage', 'uint8'],
    ['precipitationFadeIn', 'uint8'],
    ['precipitationFadeOut', 'uint8'],
    ['thunderFadeIn', 'uint8'],
    ['thunderFadeOut', 'uint8'],
    ['thunderFrequency', 'uint8'],
    ['flags', 'uint8'],
    ['weatherColor', rgb],
    ['unknown3', 'uint8'],
    ['windDirection', 'uint8'],
    ['windDirectionRange', 'uint8'],
  ],
  _NAM1: uint32le,
  _SNAM: [
    ['sound', 'uint32le'],
    ['soundType', 'uint32le'],
  ],
  _TNAM: uint32le,
  _IMSP: [
    ['sunrise', 'uint32le'],
    ['day', 'uint32le'],
    ['sunset', 'uint32le'],
    ['night', 'uint32le'],
  ],
  _DALC: [
    ['xPlus', rgb],
    ['xMinus', rgb],
    ['yPlus', rgb],
    ['yMinus', rgb],
    ['zPlus', rgb],
    ['zMinus', rgb],
    ['size', {_24:[]},[
      ['specularColor', rgb],
      ['fresnelPower', 'float'],
    ]],
  ],
  _MODL: zString,
  _MODT: modt,
  _NAM2: unknown,
  _NAM3: unknown,
  _DNAM: zString,
  _CNAM: zString,
  _BNAM: zString,
  _ANAM: zString,
  _ONAM: uint32le,
}]];

export var subrecordFields: FieldArray = [
  ['type', 'char', {size:4}],
  ['size', 'uint16le'],
  ['recordType', {
    _AACT: aact,
    _ACHR: achr,
    _ACTI: acti,
    _ADDN: addn,
    _ALCH: alch,
    _AMMO: ammo,
    _ANIO: anio,
    _APPA: appa,
    _ARMA: arma,
    _ARMO: armo,
    _ARTO: arto,
    _ASPC: aspc,
    _ASTP: astp,
    _AVIF: avif,
    _BOOK: book,
    _BPTD: bptd,
    _CAMS: cams,
    _CELL: cell,
    _CLAS: clas,
    _CLFM: clfm,
    _CLMT: clmt,
    _COBJ: cobj,
    _COLL: coll,
    _CONT: cont,
    _CPTH: cpth,
    _CSTY: csty,
    _DEBR: debr,
    _DIAL: dial,
    _DLBR: dlbr,
    _DLVW: dlvw,
    _DOBJ: dobj,
    _DOOR: door,
    _DUAL: dual,
    _ECZM: eczn,
    _EFSH: efsh,
    _ENCH: ench,
    _EQUP: equp,
    _EXPL: expl,
    _EYES: eyes,
    _FACT: fact,
    _FLOR: flor,
    _FLST: flst,
    _FSTP: fstp,
    _FSTS: fsts,
    _FURN: furn,
    _GLOB: glob,
    _GMST: gmst,
    _GRAS: gras,
    _HAZD: hazd,
    _HDPT: hdpt,
    _IDLE: idle,
    _IDLM: idlm,
    _IMAD: imad,
    _IMGS: imgs,
    _INFO: info,
    _INGR: ingr,
    _IPCT: ipct,
    _IPDS: ipds,
    _KEYM: keym,
    _KYWD: kywd,
    _LAND: land,
    _LCRT: lcrt,
    _LCTN: lctn,
    _LGTM: lgtm,
    _LIGH: ligh,
    _LSCR: lscr,
    _LTEX: ltex,
    _LVLI: lvli,
    _LVLN: lvln,
    _LVSP: lvsp,
    _MATO: mato,
    _MATT: matt,
    _MESG: mesg,
    _MGEF: mgef,
    _MISC: misc,
    _MOVT: movt,
    _MSTT: mstt,
    _MUSC: musc,
    _MUST: must,
    _NAVI: navi,
    _NAVM: navm,
    _NPC_: npc_,
    _OTFT: otft,
    _PACK: pack,
    _PERK: perk,
    _PGRE: pgre,
    _PHZD: phzd,
    _PROJ: proj,
    _QUST: qust,
    _RACE: race,
    _REFR: refr,
    _REGN: regn,
    _RELA: rela,
    _REVB: revb,
    _RFCT: rfct,
    _SCEN: scen,
    _SCRL: scrl,
    _SHOU: shou,
    _SLGM: slgm,
    _SMBN: smbn,
    _SMEN: smen,
    _SMQN: smqn,
    _SNCT: snct,
    _SNDR: sndr,
    _SOPM: sopm,
    _SOUN: soun,
    _SPEL: spel,
    _SPGD: spgd,
    _STAT: stat,
    _TACT: tact,
    _TREE: tree,
    _TXST: txst,
    _VTYP: vtyp,
    _WATR: watr,
    _WEAP: weap,
    _WOOP: woop,
    _WTHR: wthr,
  }, [
    ['type', {
      // simple subrecords
      _BAMT: uint32le,
      _BIDS: uint32le,
      _BMCT: sString,
      _BPTN: lString,
      _BPNN: zString,
      _BPNT: zString,
      _BPNI: zString,
      _CITC: uint32le,
      _DESC: lString,
      _DMDL: zString,
      _EAMT: uint16le,
      _EDID: zString,
      _EFID: uint32le,
      _EITM: uint32le,
      _ETYP: uint32le,
      _FCHT: zString,
      _FPRT: zString,
      _FULL: lString,
      _ICON: zString,
      _ICO2: zString,
      _INTV: uint32le,
      _KNAM: uint32le,
      _LLCT: uint8,
      _LVLD: uint8,
      _LVLF: uint8,
      _MCHT: zString, 
      _MICO: zString,
      _MIC2: zString,
      _MOD2: zString,
      _MOD3: zString,
      _MOD4: zString,
      _MOD5: zString,
      _MPRT: zString,
      _NVER: uint32le,
      _QUAL: uint32le,
      _RAGA: uint32le,
      _SLCP: uint8,
      _SOUL: uint8,
      _XAPD: uint8,
      _XEZN: uint32le,
      _XHOR: uint32le,
      _XLCM: uint32le,
      _XLCN: uint32le,
      _XLRL: uint32le,
      _XOWN: uint32le,
      _XPRD: float,
      _XRGD: unknown,
      _XRGB: unknown,
      _XSCL: float,
      _XXXX: xxxx,
      _ZNAM: uint32le,
      // complex subrecords similar across all subrecords
      _AVSK: [
        ['skillUseMult', 'float'],
        ['skillUseOffset', 'float'],
        ['skillImproveMult', 'float'],
        ['skillImproveOffset', 'float'],
      ],
      _BODT: [
        ['bodyPartFlags', 'uint32le'],
        ['flags', 'uint8'],
        ['unknown1', 'uint8'],
        ['unknown2', 'uint16le'],
        ['version', {_20: [], _21: []}, [
          ['skill', 'uint32le'],
        ]],
      ],
      _BOD2: [
        ['bodyPartFlags', 'uint32le'],
        ['skill', 'uint32le'],
      ],
      _BPND: [
        ['damageMult', 'float'],
        ['flags', 'uint8'],
        ['partType', 'uint8'],
        ['healthPercent', 'uint8'],
        ['actorValue', 'int8'],
        ['toHitChance', 'uint8'],
        ['explodableChance', 'uint8'],
        ['explodableDebrisCount', 'uint16le'],
        ['explodableDebris', 'uint32le'],
        ['explodableExplosion', 'uint32le'],
        ['trackingMaxAngle', 'float'],
        ['explodableDebrisScale', 'float'],
        ['severableDebrisCount', 'int32le'],
        ['severableDebris', 'uint32le'],
        ['severableExplosion', 'uint32le'],
        ['severableDebrisScale', 'float'],
        ['tX', 'float'],
        ['tY', 'float'],
        ['tZ', 'float'],
        ['rX', 'float'],
        ['rY', 'float'],
        ['rZ', 'float'],
        ['severableImpactDataSet', 'uint32le'],
        ['explodableImpactDataSet', 'uint32le'],
        ['severableDecalCount', 'uint8'],
        ['explodableDecalCount', 'uint8'],
        ['unknown', 'uint16le'],
        ['limbReplacementScale', 'float'],
      ],
      _CTDA: [
        ['operator', 'uint8'],
        ['unknown1', 'uint8'],
        ['unknown2', 'uint16le'],
        ['operator', {_4: [
          ['comparisonFormId', 'uint32le'],
        ]}, [
          ['comparisonValue', 'float'],
        ], {flag:true}], // unimplemented until i find an example
        ['functionIndex', 'uint16le'],
        ['unknown3', 'uint16le'],
        ['params', 'uint8', {size:'size', sizeOffset:-12}],
      ],
      _DEST: dest,
      _DSTD: dstd,
      _EFIT: [
        ['magnitude', 'float'],
        ['areaOfEffect', 'uint32le'],
        ['duration', 'uint32le'],
      ],
      _HEDR: [
        ['version', 'float'],
        ['numRecords', 'int32le'],
        ['nextObjectId', 'uint32le'],
      ],
      _KSIZ: ksiz,
      _KWDA: kwda,
      _LVLO: [
        ['level', 'uint32le'],
        ['spellId', 'uint32le'],
        ['count', 'uint32le'],
      ],
      _MODT: modt, _DMDT: modt, _MO2T: modt, _MO3T: modt, _MO4T: modt, _MO5T: modt,
      _MODS: mods, _DMDS: mods, _MO2S: mods, _MO3S: mods, _MO4S: mods, _MO5S: mods,
      _NVMI: [
        ['navmesh', 'uint32le'],
        ['unknown1', 'uint32le'],
        ['x', 'float'],
        ['y', 'float'],
        ['z', 'float'],
        ['mergeFlags', 'uint32le'],
        ['mergeCount', 'uint32le'],
        ['mergedTo', 'uint32le', {size:'mergeCount'}],
        ['preferredCount', 'uint32le'],
        ['preferredMerges', 'uint32le', {size:'preferredCount'}],
        ['linkedDoors', 'uint32le'],
        ['doors', [
          ['unknown', 'uint32le'],
          ['door', 'uint32le'],
        ], {size:'linkedDoors'}],
        ['isIsland', 'uint8'],
        ['isIsland', {_0: []}, [
          ['minX', 'float'],
          ['minY', 'float'],
          ['minZ', 'float'],
          ['maxX', 'float'],
          ['maxY', 'float'],
          ['maxZ', 'float'],
          ['triangleCount', 'uint32le'],
          ['triangles', [
            ['indices', 'uint16le', {size:3}],
          ], {size:'triangleCount'}],
          ['vertexCount', 'uint32le'],
          ['vertices', [
            ['vertex', 'float', {size: 3}],
          ], {size:'vertexCount'}],
        ]],
        ['marker', 'uint32le'],
        ['worldSpace', 'uint32le'],
        ['worldSpace', {_60: [
          ['gridX', 'int16le'],
          ['gridY', 'int16le'],
        ]}, [
          ['cell', 'uint32le'],
        ]],
      ],
      _NVPP: [
        ['pathCount', 'uint32le'],
        ['paths', [
          ['formIdCount', 'uint32le'],
          ['pathFormId', 'uint32le', {size:'formIdCount'}],
        ], {size:'pathCount'}],
        ['indexSize', 'uint32le'],
        ['indices', [
          ['node', 'uint32le'],
          ['nodeIndex', 'uint32le'],
        ], {size: 'indexSize'}],
      ],
      _OBND: obnd,
      _PTDO: [
        ['ptdoType', 'uint32le'],
        ['ptdoType', {
          _0: [['formId', 'uint32le']],
          _1: [['topic', 'char', {size:4}]],
        }],
      ],
      _VMAD: vmad,
      _WLST: [
        ['weather', 'uint32le'],
        ['percent', 'uint32le'],
        ['global', 'uint32le'],
      ],
      _XAPR: xapr,
      _XESP: xesp,
      _XLKR: [
        ['formIds', 'uint32le', {size:'size', sizeDivideBy: 4}],
      ],
      // subrecords that are different depending record type
      _ANAM: [['recordType', {
        _FOOO: zString,
        _WATR: uint8,
      }, unknown]],
      _BNAM: [['recordType', {
        _ANIO: zString,
        _ASPC: uint32le,
      }, unknown]],
      _CNAM: [['recordType', {
        _AVIF: uint32le,
        _BOOK: lString,
        _TES4: zString,
      }, unknown]],
      _DATA: [
        ['recordType', {
          _CAMS: [
            ['action', 'uint32le'],
            ['location', 'uint32le'],
            ['target', 'uint32le'],
            ['flags', 'uint32le'],
            ['playerTimeMult', 'float'],
            ['targetTimeMult', 'float'],
            ['globalTimeMult', 'float'],
            ['maxTime', 'float'],
            ['minTime', 'float'],
            ['betweenPercent', 'float'],
            ['nearTargetDistance', 'float', {omitIfZero:true}],
          ],
          _CELL: [
            ['entries', uint8, {size:-1}], // 1 or 2 bytes
          ],
          _CPTH: uint8,
          _DUAL: [
            ['projectile', 'uint32le'],
            ['explosion', 'uint32le'],
            ['effectShader', 'uint32le'],
            ['hitEffectArt', 'uint32le'],
            ['impactDataSet', 'uint32le'],
            ['flags', 'uint32le'],
          ],
          _DEBR: [
            ['percent', 'uint8'],
            ...zString,
            ['flags', 'uint8'],
          ],
          _EYES: uint8,
          _GMST: [
            ['value', 'uint32le'], // actually based on EDID prefix, but hey
          ],
          _GRAS: [
            ['density', 'uint8'],
            ['minSlope', 'uint8'],
            ['maxSlope', 'uint8'],
            ['unknown1', 'uint8'],
            ['distanceFromWater', 'uint16le'],
            ['unknown2', 'uint16le'],
            ['howApplied', 'uint32le'],
            ['positionRange', 'float'],
            ['heightRange', 'float'],
            ['colorRange', 'float'],
            ['wavePeriod', 'float'],
            ['flags', 'uint32le'],
          ],
          _PERK: unknown,
          
          _REVB: [
            ['decayTime', 'uint16le'],
            ['HFReference', 'uint16le'],
            ['roomFilter', 'int8'],
            ['roomHFFilter', 'int8'],
            ['reflections', 'int8'],
            ['reverbAmp', 'int8'],
            ['decayHFRatio', 'uint8'],
            ['scaledReflectDelay', 'uint8'],
            ['reverbDelay', 'uint8'],
            ['diffusionPercent', 'uint8'],
            ['densityPercent', 'uint8'],
            ['unknown', 'uint8'],
          ],
          _SLGM: goldAndWeight,
          _WATR: uint16le,
          _WRLD: uint8,
        }, unknown],
      ],
      _DNAM: [['recordType', {
        _DOBJ: [
          ['entries', [
            ['key', 'char', {size:4}],
            ['value', 'uint32le'],
          ], {size:-1}],
        ],
        _MATO: unknown,
        _VTYP: uint8,
      }, unknown]],
      _ENAM: [['recordType', {
        _FOOO: [['value', 'char', {size:4}]], // look for this
      }, unknown]],
      _ENIT: [['recordType', {
        _ALCH: [
          ['potionValue', 'uint32le'],
          ['flags', 'uint32le'],
          ['addiction', 'uint32le'],
          ['addictionChance', 'uint32le'],
          ['useSound', 'uint32le'],
        ],
        _INGR: goldAndWeight,
      }, unknown]],
      _FNAM: [['recordType', {
        _DOOR: uint8,
        _WATR: uint8,
        _CLMT: zString,
        _SNCT: uint32le,
      }, unknown]],
      _GNAM: [['recordType', {
        _FOOO: zString, // look for this
      }, unknown]],
      _HNAM: [['recordType', {
        _FOOO: float,
        _LTEX: uint16le,
      }, unknown]],
      _INAM: [['recordType', {
        _FOOO: uint16le,
        _MOVT: [
          ['directionScale', 'float'],
          ['movementSpeed', 'float'],
          ['rotationSpeed', 'float'],
        ],
      }, unknown]],
      _MNAM: [['recordType', {
        _COLL: zString,
        _WATR: uint8,
      }, unknown]],
      _MODL: [['recordType', {
        _APPA: zString,
        _BPTD: zString,
        _CAMS: zString,
        _CLMT: zString,
        _GRAS: zString,
        _MATO: zString,
        _SLGM: zString,
        _TACT: zString,
      }, unknown]],
      _NAME: [['recordType', {
        _RACE: zString,
      }, unknown]],
      _NAM0: [['recordType', {
        _FOOO: uint32le,
        _WATR: [['value', 'float', {size:3}]],
      }, unknown]],
      _NAM1: [['recordType', {
        _FOOO: uint32le,
        _BPTD: zString,
      }, unknown]],
      _NAM2: [['recordType', {
        _FOOO: uint32le,
        _WTHR: [['value', 'uint32le', {size:4}]],
      }, unknown]],
      _NAM3: [['recordType', {
        _FOOO: uint32le,
        _WTHR: [['value', 'uint32le', {size:4}]],
      }, unknown]],
      _NAM4: [['recordType', {
        _FOOO: zString,
        _WRLD: float,
      }, unknown]],
      _ONAM: [['recordType', {
        _AMMO: sString,
        _ARMA: uint32le,
      }, unknown]],
      _PNAM: [['recordType', {
        _ACTI: rgb,
        _EQUP: [
          ['formIds', [
            ['formId', 'uint32le'],
          ], {size:-1}]
        ],
      }, unknown]],
      _RDAT: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _RNAM: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _SNAM: [['recordType', {
        _LTEX: uint8,
      }, unknown]],
      _SNDD: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
      _TNAM: [['recordType', {
        _CLMT: [
          ['sunriseBegin', 'uint8'],
          ['sunriseEnd', 'uint8'],
          ['sunsetBegin', 'uint8'],
          ['sunsetEnd', 'uint8'],
          ['volatility', 'uint8'],
          ['moons', 'uint8'],
        ],
      }, unknown]],
      _UNAM: [['recordType', {
        _FOOO: uint16le,
        _WRLD: zString,
      }, unknown]],
      _VNAM: [['recordType', {
        _AVIF: float,
        _SNCT: uint16le,
      }, unknown]],
      _WNAM: [['recordType', {
        _FOOO: uint16le,
      }, unknown]],
      _XNAM: [['recordType', {
        _CELL: uint8,
      }, unknown]],
      _YNAM: [['recordType', {
        _FOOO: uint32le,
      }, unknown]],
    }, unknown],
  ]],
];
