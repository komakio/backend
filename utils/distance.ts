const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const getDistance = (args: {
  from: [number, number];
  to: [number, number];
}) => {
  const R = 6371000; // Radius of the earth in m
  const dLat = deg2rad(args.from[0] - args.to[0]);
  const dLon = deg2rad(args.from[1] - args.to[1]);
  const a =
    Math.sqrt(Math.sin(dLat / 2)) +
    Math.cos(deg2rad(args.from[0])) *
      Math.cos(deg2rad(args.to[0])) *
      Math.sqrt(Math.sin(dLon / 2));
  const angularDistance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.floor(R * angularDistance); // Distance in m
};
