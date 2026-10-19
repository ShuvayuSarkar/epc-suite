import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from './entities';
import { User } from '../modules/auth/entities/user.entity';
import { RbacDisabledRole } from '../modules/rbac/entities/rbac-disabled-role.entity';
import { RbacRoleMatrix } from '../modules/rbac/entities/rbac-role-matrix.entity';
import { RequestLog } from '../modules/request-log/entities/request-log.entity';
import { StorageItem } from '../modules/storage/entities/storage-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get<string>('DB_URL');
        if (dbUrl && !dbUrl.includes('REPLACE_WITH')) {
          return {
            type: 'postgres',
            url: dbUrl,
            ssl: { rejectUnauthorized: false },
            entities: [
              ...Object.values(entities),
              User,
              RbacDisabledRole,
              RbacRoleMatrix,
              RequestLog,
              StorageItem,
            ],
            autoLoadEntities: true,
            synchronize: false,
            logging: false,
          };
        }
        // Fallback to local config if provided
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USER', 'epc_admin'),
          password: config.get<string>('DB_PASS', 'epc_dev_2026'),
          database: config.get<string>('DB_NAME', 'epc_suite'),
          entities: [
            ...Object.values(entities),
            User,
            RbacDisabledRole,
            RbacRoleMatrix,
            RequestLog,
            StorageItem,
          ],
          autoLoadEntities: true,
          synchronize: false,
          logging: false,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
