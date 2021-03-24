export class AppError {
  message: string;

  public get errMessage(): string {
    return this.message;
  }

  constructor(message: string) {
    this.message = message;
  }
}
