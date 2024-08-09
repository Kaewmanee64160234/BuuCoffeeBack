import { IsNotEmpty } from 'class-validator';
import { CreateCheckingredientitemDto } from 'src/checkingredientitems/dto/create-checkingredientitem.dto';
export class CreateCheckingredientDto {
  @IsNotEmpty()
  date: Date;

  @IsNotEmpty()
  userId: number;
  @IsNotEmpty()
  actionType: string;
  @IsNotEmpty()
  checkDescription: string;

  @IsNotEmpty()
  checkingredientitems: CreateCheckingredientitemDto[];
}
