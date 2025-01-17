import '@testing-library/jest-dom';

// Mock the Convex client
jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  useConvex: jest.fn(),
  useMutation: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the auth actions
jest.mock('@convex-dev/auth/react', () => ({
  useAuthActions: jest.fn(),
})); 