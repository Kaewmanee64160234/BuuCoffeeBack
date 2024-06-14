import {
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
  IsInt,
  Min,
  MaxLength,
  IsDecimal,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum PromotionType {
  DISCOUNT_PRICE = 'discountPrice',
  BUY_ONE_GET_ONE = 'buy1get1',
  USE_POINTS = 'usePoints',
  DISCOUNT_PERCENTAGE = 'discountPercentage',
}
export class CreatePromotionDto {
  @IsString()
  promotionName: string;

  @IsEnum(PromotionType)
  promotionType: PromotionType;

  @IsDate()
  startDate: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  conditionQuantity?: number;

  @IsOptional()
  @IsNumber()
  buyProductId?: number;

  @IsOptional()
  @IsNumber()
  freeProductId?: number;

  @IsOptional()
  @IsNumber()
  conditionValue1?: number;

  @IsOptional()
  @IsNumber()
  conditionValue2?: number;

  @IsString()
  promotionDescription: string;

  @IsOptional()
  @IsBoolean()
  noEndDate?: boolean;

  promotionForStore: string;
  promotionCanUseManyTimes: boolean;
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
