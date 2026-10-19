import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { ResourceManagementService } from './resource-management.service';
import { RegisterAssetDto } from './dto/register-asset.dto';
import { AssignAssetDto } from './dto/assign-asset.dto';

@Controller('api/v1/resources')
export class ResourceManagementController {
    constructor(private readonly resourceService: ResourceManagementService) {}

    @Post()
    registerAsset(@Body() dto: RegisterAssetDto) {
        return this.resourceService.registerAsset(dto);
    }

    @Get()
    findAll() {
        return this.resourceService.findAll();
    }

    @Patch(':id/assign')
    assignAsset(@Param('id') id: string, @Body() dto: AssignAssetDto) {
        if (dto.projectId) return this.resourceService.assignToProject(id, dto.projectId);
        if (dto.gangId) return this.resourceService.assignToGang(id, dto.gangId);
    }

    @Patch(':id/release')
    releaseAsset(@Param('id') id: string) {
        return this.resourceService.releaseAsset(id);
    }
}
