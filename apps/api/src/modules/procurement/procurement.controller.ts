import { Controller, Post, Body, Param, Patch, Get } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { IssuePoDto } from './dto/issue-po.dto';
import { SelectVendorDto } from './dto/select-vendor.dto';
import { POStatus } from './entities/procurement-order.entity';

@Controller('api/v1/procurement')
export class ProcurementController {
    constructor(private readonly procurementService: ProcurementService) {}

    @Post('vendors')
    registerVendor(@Body() dto: RegisterVendorDto) {
        return this.procurementService.registerVendor(dto);
    }

    @Post('vendor-selection')
    selectVendorForCategory(@Body() dto: SelectVendorDto) {
        return this.procurementService.selectVendorForCategory(dto.projectId, dto.category, dto.vendorId);
    }

    @Post('purchase-orders')
    issuePO(@Body() dto: IssuePoDto) {
        return this.procurementService.issuePO(dto);
    }

    @Patch('purchase-orders/:id/status')
    updatePOStatus(@Param('id') id: string, @Body('status') status: POStatus) {
        if (status === POStatus.ACKNOWLEDGED) {
            return this.procurementService.acknowledgePO(id);
        }
        return this.procurementService.updatePOStatus(id, status);
    }

    @Get('vendors/by-category/:category')
    getVendorsByCategory(@Param('category') category: string) {
        return this.procurementService.getVendorsByCategory(category);
    }

    @Get('vendor-scorecard/:vendorId')
    getVendorScorecard(@Param('vendorId') vendorId: string) {
        return this.procurementService.getVendorScorecard(vendorId);
    }

    @Get('dashboard/:projectId')
    getProcurementDashboard(@Param('projectId') projectId: string) {
        return this.procurementService.getProcurementDashboard(projectId);
    }

    @Get('category-status/:projectId')
    getPerCategoryFinalizationStatus(@Param('projectId') projectId: string) {
        return this.procurementService.getPerCategoryFinalizationStatus(projectId);
    }

    @Get('po-tracker/:projectId')
    getPOTracker(@Param('projectId') projectId: string) {
        return this.procurementService.getPOTracker(projectId);
    }
}
