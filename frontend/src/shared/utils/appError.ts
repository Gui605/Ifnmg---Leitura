export class AppError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, AppError.prototype);
  }
  static internal(message: string) {
    return new AppError(message, 500);
  }
}
