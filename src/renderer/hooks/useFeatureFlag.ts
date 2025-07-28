import { FEATURE_FLAGS } from '../config/features';

export const useFeatureFlag = (flag: keyof typeof FEATURE_FLAGS) => {
  return FEATURE_FLAGS[flag];
};

export const useExperimentalFeature = (
  flag: keyof typeof FEATURE_FLAGS.experimental,
) => {
  return FEATURE_FLAGS.experimental[flag];
};

export const useABTest = (test: keyof typeof FEATURE_FLAGS.abTests) => {
  return FEATURE_FLAGS.abTests[test];
};
