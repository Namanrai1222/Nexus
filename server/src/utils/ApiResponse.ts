export class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
