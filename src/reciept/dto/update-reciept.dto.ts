import { PartialType } from '@nestjs/mapped-types';
import { CreateRecieptDto } from './create-reciept.dto';

export class UpdateRecieptDto extends PartialType(CreateRecieptDto) {}
