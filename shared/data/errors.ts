import { I_ApiError } from '@/shared/types';


class ApiError extends Error implements I_ApiError {
  status?: number;
  rawError?: any;

  constructor(a: { message: string, status?: number, rawError?: any }) {
    super(a.message);
    this.name = 'ApiError';
    this.status = a.status;
    this.rawError = a.rawError;
  }
}

export default ApiError;