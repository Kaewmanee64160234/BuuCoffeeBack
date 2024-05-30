import { IsNotEmpty } from 'class-validator';
import { CreateImportingredientitemDto } from 'src/importingredientitems/dto/create-importingredientitem.dto';
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
  importingredientitem: CreateImportingredientitemDto[];
}
