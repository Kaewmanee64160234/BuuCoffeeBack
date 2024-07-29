import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
export class CreateExportingredientDto {
  @IsNotEmpty()
  exportID;
  @IsNotEmpty()
  exportDate;
  @IsOptional()
  @IsString()
  exportDescription;
  @IsNotEmpty()
  @IsNumber()
  userId;
}
