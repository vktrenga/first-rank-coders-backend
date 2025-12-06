export class BaseResponse<T = any> {
  status?: boolean;
  message?: string;
  data?: T;
  errors?: any;
  timestamp?: string;
  errorCode?: any;

  constructor(partial: Partial<BaseResponse<T>>) {
    if (partial) Object.assign(this, partial);
  }

  static success<T>(data: T, message = 'Success'): BaseResponse<T> {
    return new BaseResponse({ status: true, message, data, timestamp: new Date().toISOString() });
  }

  static error<T>(message: string, errors?: any, errorCode?: any): BaseResponse<T> {
    return new BaseResponse({
      status: false,
      message,
      timestamp: new Date().toISOString(),
      errors: errors?.errors ?? null,
      errorCode: errorCode ?? null,
    });
  }
}
