import { Profile, CoordinateTypeEnum } from '@backend/profiles/profiles.model';

export const mockHelperProfile: Profile = {
  self: true,
  firstName: 'Jane',
  lastName: 'Doe',
  address: {
    raw: 'Kronprinsessegade 46e, 1306, København K, Denmark',
    location: {
      type: CoordinateTypeEnum.Point,
      coordinates: [55.685966, 12.565402],
    },
  },
  phone: { dialCode: '+45', number: '0000000' },
};

export const mockNeederProfile: Profile = {
  self: true,
  firstName: 'John',
  lastName: 'Doe',
  address: {
    raw: 'Søtorvet 2, 1371 København, Danmark',
    location: {
      type: CoordinateTypeEnum.Point,
      coordinates: [55.686779, 12.563942],
    },
  },
  phone: { dialCode: '+45', number: '0000000' },
};
