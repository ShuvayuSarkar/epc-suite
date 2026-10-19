import { PartialType } from '@nestjs/mapped-types';
import { CreatePoLineItemDto } from './create-po-line-item.dto';

export class UpdatePoLineItemDto extends PartialType(CreatePoLineItemDto) {}
