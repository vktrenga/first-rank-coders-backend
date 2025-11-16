import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MaskService } from './mask.service';

// Example interceptor to mask personal info in responses
@Injectable()
export class MaskPersonalInfoInterceptor implements NestInterceptor {
  constructor(private readonly maskService: MaskService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Mask email, phone, and name if present in response
        if (data?.email) data.email = this.maskService.maskEmail(data.email);
        if (data?.phone) data.phone = this.maskService.maskPhone(data.phone);
        if (data?.name) data.name = this.maskService.maskName(data.name);
        return data;
      })
    );
  }
}
