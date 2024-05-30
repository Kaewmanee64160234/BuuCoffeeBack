import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptPromotionDto } from './create-receipt-promotion.dto';

export class UpdateReceiptPromotionDto extends PartialType(
  CreateReceiptPromotionDto,
) {}
