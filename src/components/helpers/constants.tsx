export const TIMEOUT_115_SECONDS = 115 * 1000;
export const TIMEOUT_13_MINUTES = 780 * 1000;

const apiConfig = {
  cessation: {
    shuttering: {
      featureID: 'Cessation'
    },
    askHmrcSubLink: 'self-assessment-cessation'
  },
  registration: {
    shuttering: {
      featureID: 'SA'
    },
    askHmrcSubLink: 'self-assessment-cessation'
  },
  'appeal-a-self-assessment-penalty': {
    shuttering: {
      featureID: 'Appeal'
    },
    askHmrcSubLink: 'self-assessment-cessation'
  }
};

export default apiConfig;
