import { IsString, IsDateString, IsInt } from 'class-validator';

export class CreateSeasonDto {
  @IsString()
  name: string;

  @IsInt()
  createdById: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
