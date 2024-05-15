import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptItemDto } from './create-receipt-item.dto';

export class UpdateReceiptItemDto extends PartialType(CreateReceiptItemDto) {}
