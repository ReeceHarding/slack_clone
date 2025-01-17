import { describe, it, expect, jest } from '@jest/globals';
import { useConvex, ConvexProvider } from 'convex/react';
import { api, SignInResponse, CreateUserResponse } from '@convex/_generated/api';
import { useAuthActions } from '@convex-dev/auth/react';
import { renderHook } from '@testing-library/react';
import React from 'react';

jest.mock('convex/react', () => ({
  useConvex: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@convex-dev/auth/react', () => ({
  useAuthActions: jest.fn(),
}));

describe('Auth Tests', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('handles successful sign in', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ userId: 'test-user-id' } as SignInResponse);
    const mockCreateUser = jest.fn().mockResolvedValue({ id: 'test-user-id' } as CreateUserResponse);

    const mockConvex = {
      mutation: jest.fn().mockReturnValue(mockCreateUser),
      action: jest.fn().mockReturnValue(mockSignIn),
    };

    (useConvex as jest.Mock).mockReturnValue(mockConvex);
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      createUser: mockCreateUser,
    });

    const { result } = renderHook(() => useAuthActions());

    await result.current.signIn({
      email: testUser.email,
      password: testUser.password,
    });

    expect(mockSignIn).toHaveBeenCalledWith({
      email: testUser.email,
      password: testUser.password,
    });
  });

  it('handles sign in error', async () => {
    const mockError = new Error('Invalid credentials');
    const mockSignIn = jest.fn().mockRejectedValue(mockError);
    const mockCreateUser = jest.fn().mockResolvedValue({ id: 'test-user-id' } as CreateUserResponse);

    const mockConvex = {
      mutation: jest.fn().mockReturnValue(mockCreateUser),
      action: jest.fn().mockReturnValue(mockSignIn),
    };

    (useConvex as jest.Mock).mockReturnValue(mockConvex);
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      createUser: mockCreateUser,
    });

    const { result } = renderHook(() => useAuthActions());

    await expect(
      result.current.signIn({
        email: testUser.email,
        password: testUser.password,
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('handles successful user creation', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ userId: 'test-user-id' } as SignInResponse);
    const mockCreateUser = jest.fn().mockResolvedValue({ id: 'test-user-id' } as CreateUserResponse);

    const mockConvex = {
      mutation: jest.fn().mockReturnValue(mockCreateUser),
      action: jest.fn().mockReturnValue(mockSignIn),
    };

    (useConvex as jest.Mock).mockReturnValue(mockConvex);
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      createUser: mockCreateUser,
    });

    const { result } = renderHook(() => useAuthActions());

    await result.current.createUser({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
    });

    expect(mockCreateUser).toHaveBeenCalledWith({
      name: testUser.name,
      email: testUser.email,
      password: testUser.password,
    });
  });
}); 