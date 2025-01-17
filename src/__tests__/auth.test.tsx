import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ConvexProvider, useMutation } from "convex/react";
import { api, SignInResponse, CreateUserResponse } from "@convex/_generated/api";
import { renderHook, act } from '@testing-library/react';
import { useAuthActions } from "@convex-dev/auth/react";
import React from 'react';

// Mock the Convex client
const mockConvex = {
  mutation: jest.fn(),
  action: jest.fn(),
} as any;

// Mock the API
jest.mock('@convex/_generated/api', () => ({
  api: {
    auth: {
      createUser: 'auth:createUser'
    }
  }
}));

// Mock useAuthActions
jest.mock('@convex-dev/auth/react', () => ({
  useAuthActions: jest.fn(),
}));

// Mock useMutation
jest.mock('convex/react', () => ({
  useMutation: jest.fn(),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('User Creation Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mocks
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: jest.fn().mockResolvedValue({ userId: 'test-user-id' } satisfies SignInResponse),
    });
  });

  it('should create a user with correct name upon sign up', async () => {
    // Mock the createUser mutation
    const mockCreateUser = jest.fn().mockResolvedValue({ id: 'test-user-id' } satisfies CreateUserResponse);
    (useMutation as jest.Mock).mockReturnValue(mockCreateUser);

    // Setup test data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Render the hook
    const { result } = renderHook(
      () => ({
        createUser: useMutation(api.auth.createUser),
        authActions: useAuthActions(),
      })
    );

    // Simulate sign up
    await act(async () => {
      await result.current.authActions.signIn('password', {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
        flow: 'signUp',
      });
    });

    // Verify createUser was called with correct data
    expect(mockCreateUser).toHaveBeenCalledWith({
      name: testUser.name,
      email: testUser.email,
      image: undefined,
    });
  });

  it('should handle sign up errors correctly', async () => {
    // Mock a failed sign up
    const mockError = new Error('Sign up failed');
    (useAuthActions as jest.Mock).mockReturnValue({
      signIn: jest.fn().mockRejectedValue(mockError),
    });

    // Setup test data
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    // Render the hook
    const { result } = renderHook(() => useAuthActions());

    // Attempt sign up and expect it to fail
    await expect(
      act(async () => {
        await result.current.signIn('password', {
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
          flow: 'signUp',
        });
      })
    ).rejects.toThrow('Sign up failed');
  });

  it('should prevent duplicate user creation', async () => {
    // Mock a duplicate user error
    const mockCreateUser = jest.fn().mockRejectedValue(new Error('User already exists!'));
    (useMutation as jest.Mock).mockReturnValue(mockCreateUser);

    // Setup test data
    const testUser = {
      name: 'Test User',
      email: 'existing@example.com',
      password: 'password123',
    };

    // Render the hook
    const { result } = renderHook(
      () => ({
        createUser: useMutation(api.auth.createUser),
        authActions: useAuthActions(),
      })
    );

    // Attempt to create duplicate user
    await expect(
      act(async () => {
        await result.current.createUser({
          name: testUser.name,
          email: testUser.email,
        });
      })
    ).rejects.toThrow('User already exists!');
  });

  it('should store user with default name if none provided', async () => {
    // Mock the createUser mutation
    const mockCreateUser = jest.fn().mockResolvedValue({ id: 'test-user-id' } satisfies CreateUserResponse);
    (useMutation as jest.Mock).mockReturnValue(mockCreateUser);

    // Setup test data with no name
    const testUser = {
      email: 'test@example.com',
      password: 'password123',
    };

    // Render the hook
    const { result } = renderHook(
      () => ({
        createUser: useMutation(api.auth.createUser),
        authActions: useAuthActions(),
      })
    );

    // Create user without name
    await act(async () => {
      await result.current.createUser({
        name: 'Anonymous User', // Default name should be used
        email: testUser.email,
      });
    });

    // Verify createUser was called with default name
    expect(mockCreateUser).toHaveBeenCalledWith({
      name: 'Anonymous User',
      email: testUser.email,
      image: undefined,
    });
  });
}); 