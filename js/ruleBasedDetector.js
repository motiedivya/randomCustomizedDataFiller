// js/ruleBasedDetector.js

/**
 * Currently, the detector will simply read the profile's fields.
 * Later, when integrating an LLM, this file can be extended.
 */
function detectFields(profile) {
  return profile.fields;
}

export { detectFields };
