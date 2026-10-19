import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { User } from '../auth/entities/user.entity';
import { RbacDisabledRole } from './entities/rbac-disabled-role.entity';
import { RbacRoleMatrix } from './entities/rbac-role-matrix.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RbacDisabledRole, RbacRoleMatrix]),
  ],
  controllers: [RbacController],
  providers: [RbacService],
  exports: [RbacService],
})
export class RbacModule {}
