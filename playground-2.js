const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const ucum = require('@lhncbc/ucum-lhc');
const ucumUtils = ucum.UcumLhcUtils.getInstance();
const {SerializedDocumentArray, SerializedDocument} = require('@healthtree/firestore-join');

async function checkIfValueQuantityIsWithinRange(valueQuantity, ruleData, observationMappings = []) {
  let toCompareResult;
  if (ruleData.unitNotRequired) {
    toCompareResult = {
      status: 'succeeded',
      toVal: valueQuantity.value
    };
  } else {
    // TODO: handle mol unit conversion
    // validate units (valueQuantity.unit, ruleData.unit)
    // convert valueQuantity.value to ruleData.unit
    try {
      toCompareResult = ucumUtils.convertUnitTo(
          valueQuantity.unit,
          valueQuantity.value,
          ruleData.unit
      );
    } catch(err) {
      // si de error me pide un molecullar weight, pide el mapping para sacarlo
      // convertUnitTo(fromUnitCode, fromVal, toUnitCode, false, molecularWeight) {
      if (err) {
        console.log('okay')
      }
    }

  }

  if (toCompareResult.status === 'succeeded') {
    if (Number.isFinite(ruleData.min) && Number.isFinite(ruleData.max)) {
      return toCompareResult.toVal > ruleData.min && toCompareResult.toVal < ruleData.max;
    } else if (Number.isFinite(ruleData.min)) {
      return toCompareResult.toVal > ruleData.min;
    } else if (Number.isFinite(ruleData.max)) {
      return toCompareResult.toVal < ruleData.max;
    } else {
      throw 'expected value ranges';
    }
  } else {
    return false;
  }
};

const valueQuantity = {
  unit: 'nmol/L',
  value: 500
}
const ruleData = {
  resourceToUse: 'mappings',
      operator: `INCLUDES_OR`,
      min: 5.51,
      unit: `g/dL`,
      mappings: [
        db.doc(
            '/apps/curehub/observationMappings/8c8904d0a7b5ae8c4d2bac4bffdc2ff8e5cbd69d0ec716da7c63c8a84d48f4bb'
        ),
        db.doc(
            '/apps/curehub/observationMappings/96cf450f2578b40ddbf0b524fe8c41d73291f6ef6c190793d0d5c2e9f4b17d3d'
        ),
        db.doc(
            '/apps/curehub/observationMappings/08759cd69999593a2567cf2324dc0efbbef7879cff524f04c106980b8a4db597'
        ),
        db.doc(
            '/apps/curehub/observationMappings/d1b71ef6c01de8f2adc7f229aad6a93c0db1cf9cba860c11d2069e85ed0037f1'
        ),
        db.doc(
            '/apps/curehub/observationMappings/e88b5563e0913cf1c726423702ce3e7956f7cfbaf9b6241fa59edb22fcb33dd7'
        )
      ]
};
const observationMappings = [
  db.doc(
      '/apps/curehub/observationMappings/96cf450f2578b40ddbf0b524fe8c41d73291f6ef6c190793d0d5c2e9f4b17d3d'
  ),
  db.doc(
      '/apps/curehub/observationMappings/08759cd69999593a2567cf2324dc0efbbef7879cff524f04c106980b8a4db597'
  ),
]

async function main() {
  try {
    await checkIfValueQuantityIsWithinRange(valueQuantity, ruleData, observationMappings);
  } catch (e) {
    console.error(e)
  }

}

main();

