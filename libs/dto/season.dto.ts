import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateSeasonDto {
  @IsString()
  name: string;


  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
