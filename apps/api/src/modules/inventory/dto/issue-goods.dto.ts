import { IsUUID, IsNumber, IsString } from 'class-validator';

export class IssueGoodsDto {
  @IsUUID()
  InventoryItemID: string;

  @IsNumber()
  Quantity: number;

  @IsString()
  IssuedTo: string;
}
