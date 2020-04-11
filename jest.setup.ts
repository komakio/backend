jest.setTimeout(15000);

jest.mock('./utils/time.ts', () => ({
  waitForSomeMin: jest.fn(),
  waitForSomeSeconds: jest.fn(),
  waitForSomeMs: jest.fn(),
}));
