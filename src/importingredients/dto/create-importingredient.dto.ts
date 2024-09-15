import { IsNotEmpty, IsIn, IsEnum } from 'class-validator';
import { CreateImportingredientitemDto } from 'src/importingredientitems/dto/create-importingredientitem.dto';

export enum ImportStoreType {
  COFFEE_SHOP = 'ร้านกาแฟ',
  RICE_SHOP = 'ร้านข้าว',
}

export enum ImportType {
  PIECE = 'piece',
  BOX = 'box',
}

export class CreateImportingredientDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  store: string;

  @IsNotEmpty()
  discount: number;

  @IsNotEmpty()
  total: number;

  @IsNotEmpty()
  importDescription: string;

  @IsNotEmpty()
  importingredientitem: CreateImportingredientitemDto[];

  @IsNotEmpty()
  @IsEnum(ImportStoreType)
  importStoreType: ImportStoreType;

  @IsNotEmpty()
  @IsEnum(ImportType)
  importType: ImportType;
}
