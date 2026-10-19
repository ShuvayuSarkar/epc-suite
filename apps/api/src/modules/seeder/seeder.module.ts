import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../auth/entities/user.entity';
import { RbacRoleMatrix } from '../rbac/entities/rbac-role-matrix.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, RbacRoleMatrix])],
  providers: [SeederService],
})
export class SeederModule {}
