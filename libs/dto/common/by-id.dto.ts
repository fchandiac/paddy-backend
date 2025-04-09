import { IsNotEmpty, IsString } from 'class-validator';


export class ByIdDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  
}