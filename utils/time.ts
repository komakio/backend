export const waitForSomeMin = (min: number) => {
  return new Promise(resolve => setTimeout(resolve, min * 1000 * 60));
};

export const waitForSomeSeconds = (seconds: number) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

export const waitForSomeMs = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
