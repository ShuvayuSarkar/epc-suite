import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { HotspotMappingService } from './hotspot-mapping.service';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { LogVisitDto } from './dto/log-visit.dto';
import { HotspotStatus, HotspotType } from './entities/hotspot.entity';

@Controller('api/v1/hotspots')
export class HotspotMappingController {
    constructor(private readonly hotspotService: HotspotMappingService) {}

    @Post()
    createHotspot(@Body() dto: CreateHotspotDto) {
        return this.hotspotService.createHotspot(dto);
    }

    @Patch(':id/assign')
    assignSalesExec(@Param('id') id: string, @Body('execId') execId: string, @Body('execName') execName: string) {
        return this.hotspotService.assignSalesExec(id, execId, execName);
    }

    @Post(':id/visit')
    logVisit(@Param('id') id: string, @Body() dto: LogVisitDto) {
        return this.hotspotService.logVisit(id, new Date(dto.visitDate), dto.findings);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: HotspotStatus) {
        return this.hotspotService.updateStatus(id, status);
    }

    @Patch(':id/resolve')
    resolveHotspot(@Param('id') id: string, @Body('rootCause') rootCause: string) {
        return this.hotspotService.resolveHotspot(id, rootCause);
    }

    @Patch(':id/escalate')
    escalateHotspot(@Param('id') id: string) {
        return this.hotspotService.escalateHotspot(id);
    }

    @Get('by-project/:projectId')
    getHotspotsByProject(@Param('projectId') projectId: string) {
        return this.hotspotService.getHotspotsByProject(projectId);
    }

    @Get('by-type/:projectId/:type')
    getHotspotsByType(@Param('projectId') projectId: string, @Param('type') type: HotspotType) {
        return this.hotspotService.getHotspotsByType(projectId, type);
    }

    @Get('dashboard/:projectId')
    getHotspotDashboard(@Param('projectId') projectId: string) {
        return this.hotspotService.getHotspotDashboard(projectId);
    }

    @Get('heatmap/:projectId')
    getHeatMapData(@Param('projectId') projectId: string) {
        return this.hotspotService.getHeatMapData(projectId);
    }

    @Get('overdue/:projectId')
    getOverdueHotspots(@Param('projectId') projectId: string) {
        return this.hotspotService.getOverdueHotspots(projectId);
    }
}
