import { SetMetadata } from '@nestjs/common';

export const Permission = (perm: string) => SetMetadata('permission', perm);
    