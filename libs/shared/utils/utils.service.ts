import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
    currentDateTime(): string {
        return new Date().toISOString();
    }
}
