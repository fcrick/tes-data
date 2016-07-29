import {
  float,
  int8,
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

var dstd: FieldArray = [
  ['healthPercent', 'uint16le'],
  ['damageStage', 'uint8'],
  ['flags', 'uint8'],
  ['selfDamageRate', 'uint32le'],
  ['explosionId', 'uint32le'],
  ['debrisId', 'uint32le'],
  ['debrisCount', 'uint32le'],
];

var goldAndWeight: FieldArray = [
  ['goldValue', 'uint32le'],
  ['weight', 'float'],
];

var ksiz: FieldArray = [['keywordCount', 'uint32le', {persist:true}]];
var kwda: FieldArray = [['keywords', 'uint32le', {size:'keywordCount'}]];

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

// sets of fields for re-use
var rgb: FieldArray = [
  ['r', 'uint8'],
  ['g', 'uint8'],
  ['b', 'uint8'],
  ['unused', 'uint8'],
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
  _EFIT: [
    ['magnitude', 'float'],
    ['areaOfEffect', 'uint32le'],
    ['duration', 'uint32le'],
  ],
  _CTDA: ctda,
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
  _XCLL: [
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
      ['fogFarColor', rgb],
      ['fogMax', 'float'],
      ['lightFadeDistancesStart', 'float'],
      ['lightFadeDistancesEnd', 'float'],
      ['flags', 'uint32le'],
    ]],
  ],
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
  _CIS1: zString,
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
  _EFIT: [
    ['magnitude', 'float'],
    ['areaOfEffect', 'uint32le'],
    ['duration', 'uint32le'],
  ],
  _CTDA: ctda,
  _CIS2: zString,
}]];

var kywd: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: rgb,
  _KSIZ: ksiz,
  _KWDA: kwda,
}]];

var lcrt: FieldArray = [['type', {
  _EDID: zString,
  _CNAM: rgb,
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
  _SCHR: [
    ['unknown1', 'uint32le'],
    ['refCount', 'uint32le'],
    ['compiledSize', 'uint32le'],
    ['variableCount', 'uint32le'],
    ['schrType', 'uint32le'],
  ],
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
  _DODT: [
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
  ],
  _DNAM: uint16le,
}]];

var xxxx: FieldArray = [
  ['xxxxSize', 'uint32le', {persist:true}],
];

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
    _KYWD: kywd,
    _LCRT: lcrt,
    _REFR: refr,
    _TXST: txst,
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
          _SPGD: [
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
