export class BaseResponse<T = any> {
  success: boolean= false;
  message?: string;
  data?: T;
  errors?: any;

  constructor(partial: Partial<BaseResponse<T>>) {
    if (partial) Object.assign(this, partial);
  }

  static success<T>(data: T, message = 'Success'): BaseResponse<T> {
    return new BaseResponse({ success: true, message, data });
  }

  static error(message: string, errors?: any): BaseResponse {
    return new BaseResponse({ success: false, message, errors });
  }
}
