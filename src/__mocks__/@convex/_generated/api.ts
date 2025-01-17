export type SignInResponse = { userId: string } | undefined;
export type CreateUserResponse = { id: string } | undefined;

export type AuthApi = {
  createUser: (args: { name: string; email: string; password: string }) => Promise<CreateUserResponse>;
  signIn: (args: { email: string; password: string }) => Promise<SignInResponse>;
};

export const api = {
  auth: {
    createUser: 'auth:createUser',
    signIn: 'auth:signIn',
  },
} as const; 