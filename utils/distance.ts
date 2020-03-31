import getPreciseDistance from 'geolib/es/getDistance';

export const getDistance = (args: {
  from: [number, number];
  to: [number, number];
}) => {
  return getPreciseDistance(
    { latitude: args.from[0], longitude: args.from[1] },
    { latitude: args.to[0], longitude: args.to[1] }
  );
};
