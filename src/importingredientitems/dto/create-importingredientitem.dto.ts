import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ImportType } from 'src/importingredients/dto/create-importingredient.dto';

export class CreateImportingredientitemDto {
  @IsNotEmpty()
  @IsNumber()
  ingredientId: number;
  @IsNotEmpty()
  @IsNumber()
  unitPrice?: number;
  @IsNotEmpty()
  @IsNumber()
  pricePerUnit?: number;
  name?: string;
  @IsNotEmpty()
  @IsNumber()
  Quantity?: number;
  @IsNotEmpty()
  @IsEnum(ImportType)
  importType: ImportType;
}
