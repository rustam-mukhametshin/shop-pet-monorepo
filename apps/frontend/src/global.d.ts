declare global {
  type ResponseJsonType<T> = {
    status: 'success' | 'error' | 'MFA_REQUIRED';
    message: string;
    data?: T;
  };
}

export {};
