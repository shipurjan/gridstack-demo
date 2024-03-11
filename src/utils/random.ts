// Standard Normal variate using Box-Muller transform.
export function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random(); // Converting [0,1) to (0,1]
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

export function uniformRandomInt(min = 0, max = 1) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function normalRandomInt(avg = 0.5, max_dev = 0.5) {
  const min = Math.ceil(avg - max_dev);
  const max = Math.floor(avg + max_dev);
  const randomNumber = gaussianRandom(avg, 0.75 * max_dev);
  return Math.floor(Math.min(Math.max(randomNumber, min), max));
}
