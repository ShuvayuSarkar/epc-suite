import { IsString, IsEnum, IsOptional, IsNumber, IsUUID, IsUrl } from 'class-validator';

export enum AwardDocumentType {
  LOA = 'LOA',
  NOA = 'NOA',
  LOI = 'LOI',
}

export enum PortalIntegrationType {
  API = 'API',
  SFTP = 'SFTP',
  MANUAL = 'MANUAL',
}

export class CreateClientDto {
  @IsString()
  clientId: string;

  @IsString()
  legalName: string;

  @IsString()
  shortName: string;

  @IsEnum(AwardDocumentType)
  awardDocumentType: AwardDocumentType;

  @IsString()
  referenceFormat: string;

  @IsUUID()
  @IsOptional()
  defaultSlaSetId?: string;

  @IsEnum(PortalIntegrationType)
  portalIntegrationType: PortalIntegrationType;

  @IsUUID()
  @IsOptional()
  templateSetId?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsNumber()
  retentionPct: number;

  @IsString()
  @IsOptional()
  ldClauseReference?: string;

  @IsUUID()
  @IsOptional()
  empanelledVendorListId?: string;

  @IsString()
  currency: string;
}
