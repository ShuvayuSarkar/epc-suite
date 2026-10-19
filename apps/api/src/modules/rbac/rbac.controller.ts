import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { RbacService } from './rbac.service';

@Controller('api/rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ─── Users ──────────────────────────────────────────────────
  @Get('users')
  getAllUsers() {
    return this.rbacService.getAllUsers();
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.rbacService.getUserById(id);
  }

  @Post('users')
  addUser(@Body() body: any) {
    return this.rbacService.addUser(body);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    return this.rbacService.updateUser(id, body);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.rbacService.updateUserRole(id, role);
  }

  @Patch('users/:id/overrides')
  updateUserOverrides(@Param('id') id: string, @Body() overrides: Record<string, string | null>) {
    return this.rbacService.updateUserOverrides(id, overrides);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.rbacService.deleteUser(id);
  }

  @Post('users/:id/reset-overrides')
  resetOverrides(@Param('id') id: string) {
    return this.rbacService.resetUserOverrides(id);
  }

  // ─── Disabled Roles ─────────────────────────────────────────
  @Get('disabled-roles')
  getDisabledRoles() {
    return this.rbacService.getDisabledRoles();
  }

  @Post('disabled-roles')
  setDisabledRoles(@Body() body: { roleIds: string[] }) {
    return this.rbacService.setDisabledRoles(body.roleIds);
  }

  @Patch('disabled-roles/:roleId/toggle')
  toggleRole(@Param('roleId') roleId: string, @Body('active') active: boolean) {
    return this.rbacService.toggleRole(roleId, active);
  }

  // ─── Role Matrix ─────────────────────────────────────────────
  @Get('role-matrix')
  getRoleMatrix() {
    return this.rbacService.getRoleMatrix();
  }

  @Patch('role-matrix/:roleId')
  updateRolePermissions(@Param('roleId') roleId: string, @Body() permissions: Record<string, string | null>) {
    return this.rbacService.updateRolePermissions(roleId, permissions);
  }

  @Post('role-matrix/reset')
  resetAllMatrix() {
    return this.rbacService.resetAllRoleMatrix();
  }
}
