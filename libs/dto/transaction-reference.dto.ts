import { IsString, IsUUID } from 'class-validator';

export class CreateTransactionReferenceDto {
  @IsString()
  transactionCode: string;

  @IsUUID()
  producerId: string;

  @IsUUID()
  parentId: string;

  @IsUUID()
  childId: string;

  @IsString()
  parentType: string;
}
