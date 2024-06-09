import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsInt,
  Min,
  MaxLength,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString()
  @MaxLength(255)
  promotionName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  promotionDescription?: string;

  @IsString()
  @MaxLength(50)
  promotionType: string;

  @IsNumber()
  discountValue: number;

  @IsInt()
  conditionQuantity: number;

  @IsInt()
  @IsOptional()
  buyProductId?: number;

  @IsInt()
  @IsOptional()
  freeProductId?: number;

  @IsDecimal()
  @IsOptional()
  conditionValue1?: number;

  @IsDecimal()
  @IsOptional()
  conditionValue2?: number;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class QueryPromotionDto {
  @IsOptional()
  @IsString()
  promotionName?: string;

  @IsOptional()
  @IsString()
  promotionType?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsInt()
  conditionQuantity?: number;
}
