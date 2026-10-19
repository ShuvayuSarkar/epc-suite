import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { RfiManagementService } from './rfi-management.service';
import { CreateRfiDto } from './dto/create-rfi.dto';
import { RespondRfiDto } from './dto/respond-rfi.dto';
import { RfiStatus } from './entities/rfi.entity';

@Controller('api/v1/rfis')
export class RfiManagementController {
    constructor(private readonly service: RfiManagementService) {}

    @Post()
    createRFI(@Body() dto: CreateRfiDto) {
        return this.service.createRFI(dto);
    }

    @Patch(':id/route')
    routeRFI(@Param('id') id: string, @Body('assignedTo') assignedTo: string) {
        return this.service.routeRFI(id, assignedTo);
    }

    @Patch(':id/respond')
    respondToRFI(@Param('id') id: string, @Body() dto: RespondRfiDto) {
        return this.service.respondToRFI(id, dto.response);
    }

    @Patch(':id/close')
    closeRFI(@Param('id') id: string) {
        return this.service.closeRFI(id);
    }

    @Get('by-project/:projectId')
    getRFIsByProject(@Param('projectId') projectId: string) {
        return this.service.getRFIsByProject(projectId);
    }

    @Get('aging/:projectId')
    getRFIAgingReport(@Param('projectId') projectId: string) {
        return this.service.getRFIAgingReport(projectId);
    }

    @Get('overdue/:projectId')
    getOverdueRFIs(@Param('projectId') projectId: string) {
        return this.service.getOverdueRFIs(projectId);
    }

    @Get('register/:projectId')
    getRFIRegister(@Param('projectId') projectId: string) {
        return this.service.getRFIRegister(projectId);
    }
}
