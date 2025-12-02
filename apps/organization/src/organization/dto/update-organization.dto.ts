import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {
	@ApiPropertyOptional({ type: String, description: 'Organization ID' })
	id?: string;
}
