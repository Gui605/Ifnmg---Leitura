import { ErrorCodes } from '../types/errors';

export class AppError extends Error {
  status?: number;
  errorCode?: ErrorCodes;

  constructor(message: string, status?: number, errorCode?: ErrorCodes) {
    super(message);
    this.status = status;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static internal(message: string) {
    return new AppError(message, 500, ErrorCodes.INTERNAL_ERROR);
  }
}