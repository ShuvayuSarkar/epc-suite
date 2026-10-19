import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { RbacDisabledRole } from './entities/rbac-disabled-role.entity';
import { RbacRoleMatrix } from './entities/rbac-role-matrix.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RbacDisabledRole)
    private readonly disabledRoleRepo: Repository<RbacDisabledRole>,
    @InjectRepository(RbacRoleMatrix)
    private readonly roleMatrixRepo: Repository<RbacRoleMatrix>,
  ) {}

  // ─── Users ──────────────────────────────────────────────────
  async getAllUsers() {
    const users = await this.userRepo.find();
    return users.map(({ password_hash, ...u }) => u);
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password_hash, ...rest } = user;
    return rest;
  }

  async updateUserRole(id: string, newRole: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, { role: newRole as any });
    return { success: true };
  }

  async updateUserOverrides(id: string, overrides: Record<string, string | null>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, { overrides });
    return { success: true };
  }

  async updateUser(id: string, updates: Partial<{ name: string; email: string; department: string; avatar: string }>) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, updates);
    return { success: true };
  }

  async addUser(userData: Partial<User>) {
    const user = this.userRepo.create(userData);
    return await this.userRepo.save(user);
  }

  async deleteUser(id: string) {
    await this.userRepo.delete(id);
    return { success: true };
  }

  async resetUserOverrides(id: string) {
    await this.userRepo.update(id, { overrides: {} });
    return { success: true };
  }

  // ─── Disabled Roles ─────────────────────────────────────────
  async getDisabledRoles(): Promise<string[]> {
    const rows = await this.disabledRoleRepo.find();
    return rows.map(r => r.role_id);
  }

  async setDisabledRoles(roleIds: string[]) {
    await this.disabledRoleRepo.clear();
    if (roleIds.length > 0) {
      const entities = roleIds
        .filter(r => r !== 'system_admin') // Always protect admin
        .map(r => this.disabledRoleRepo.create({ role_id: r }));
      await this.disabledRoleRepo.save(entities);
    }
    return { success: true };
  }

  async toggleRole(roleId: string, active: boolean) {
    if (roleId === 'system_admin') return { success: true }; // protected
    if (active) {
      await this.disabledRoleRepo.delete({ role_id: roleId });
    } else {
      const exists = await this.disabledRoleRepo.findOne({ where: { role_id: roleId } });
      if (!exists) {
        await this.disabledRoleRepo.save(this.disabledRoleRepo.create({ role_id: roleId }));
      }
    }
    return { success: true };
  }

  // ─── Role Matrix ─────────────────────────────────────────────
  async getRoleMatrix(): Promise<Record<string, Record<string, string | null>>> {
    const rows = await this.roleMatrixRepo.find();
    return rows.reduce((acc, row) => {
      acc[row.role_id] = row.permissions;
      return acc;
    }, {} as Record<string, Record<string, string | null>>);
  }

  async updateRolePermissions(roleId: string, permissions: Record<string, string | null>) {
    const existing = await this.roleMatrixRepo.findOne({ where: { role_id: roleId } });
    if (existing) {
      await this.roleMatrixRepo.update({ role_id: roleId }, {
        permissions: { ...existing.permissions, ...permissions }
      });
    } else {
      await this.roleMatrixRepo.save(
        this.roleMatrixRepo.create({ role_id: roleId, permissions })
      );
    }
    return { success: true };
  }

  async resetAllRoleMatrix() {
    await this.roleMatrixRepo.clear();
    return { success: true };
  }
}
