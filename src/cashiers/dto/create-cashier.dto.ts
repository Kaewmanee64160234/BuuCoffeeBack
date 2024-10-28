import { Type } from 'class-transformer';
import {
  IsNumber,
  IsDate,
  IsNotEmpty,
  IsPositive,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cashier } from '../entities/cashier.entity';

export class CreateCashierDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  cashierAmount: number;
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CashierItemDto)
  items: CashierItemDto[];

  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
export class CashierItemDto {
  @PrimaryGeneratedColumn()
  id: number;
  @IsNotEmpty()
  @IsEnum(['1000', '500', '100', '50', '20', '10', '5', '2', '1'])
  denomination: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
  @ManyToOne(() => Cashier, (cashier) => cashier.cashierItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  cashier: Cashier;
  timestamp?: Date;
}
