import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { RequestLogModule } from './modules/request-log/request-log.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { StorageModule } from './modules/storage/storage.module';
import { UploadsModule } from './modules/uploads/uploads.module';

// Import all application modules
import {
  ClientMasterModule,
  WbsBaselineModule,
  PoMaterialMasterModule,
  SiteSurveyModule,
  InstallationExecutionModule,
  ResourceManagementModule,
  HrPayrollModule,
  SafetyHseModule,
  EotDelayClaimsModule,
  EngineeringDocControlModule,
  CorrespondenceModule,
  MultiProjectTypeModule,
  ContractManagementModule,
  ProcurementModule,
  QaQcModule,
  HotspotMappingModule,
  InventoryModule,
  RiskManagementModule,
  FinanceModule,
  GangManagementModule,
  CollectionsModule,
  PoAmendmentModule,
  ProjectMappingDprModule,
  CommissioningHandoverModule,
  RfiManagementModule,
  DashboardsModule,
  ClientPortalModule,
} from './modules';

@Module({
  imports: [
    // 1. Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', 'apps/api/.env'] }),

    // 2. Database
    DatabaseModule,

    // 3. Foundation Infrastructure (Auth, RBAC, Request Logger, Seeder)
    AuthModule,
    RbacModule,
    RequestLogModule,
    SeederModule,
    StorageModule,
    UploadsModule,

    // 4. Application Modules
    ClientMasterModule,
    WbsBaselineModule,
    PoMaterialMasterModule,
    SiteSurveyModule,
    InstallationExecutionModule,
    ResourceManagementModule,
    HrPayrollModule,
    SafetyHseModule,
    EotDelayClaimsModule,
    EngineeringDocControlModule,
    CorrespondenceModule,
    MultiProjectTypeModule,
    ContractManagementModule,
    ProcurementModule,
    QaQcModule,
    HotspotMappingModule,
    InventoryModule,
    RiskManagementModule,
    FinanceModule,
    GangManagementModule,
    CollectionsModule,
    PoAmendmentModule,
    ProjectMappingDprModule,
    CommissioningHandoverModule,
    RfiManagementModule,
    DashboardsModule,
    ClientPortalModule,
  ],
})
export class AppModule {}
