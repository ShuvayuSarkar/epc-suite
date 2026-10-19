import { Controller, Get, Post, Body, Put, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MultiProjectTypeService } from './multi-project-type.service';
import { CreateProjectTypeDto } from './dto/create-project-type.dto';
import { InstantiateProjectDto } from './dto/instantiate-project.dto';

@Controller('api/v1/project-types')
export class MultiProjectTypeController {
  constructor(private readonly multiProjectTypeService: MultiProjectTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createType(@Body() createProjectTypeDto: CreateProjectTypeDto) {
    return this.multiProjectTypeService.createProjectType(createProjectTypeDto);
  }

  @Post(':id/templates')
  @HttpCode(HttpStatus.CREATED)
  createTemplate(@Param('id') id: string, @Body() templateData: any) {
    return this.multiProjectTypeService.createTemplate(id, templateData);
  }

  @Put('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() updates: any) {
    return this.multiProjectTypeService.updateTemplate(id, updates);
  }

  @Post('instantiate')
  @HttpCode(HttpStatus.CREATED)
  instantiate(@Body() instantiateProjectDto: InstantiateProjectDto) {
    return this.multiProjectTypeService.instantiateProject(instantiateProjectDto);
  }

  @Get()
  getTypes() {
    return this.multiProjectTypeService.getAvailableTypes();
  }

  @Get(':code/template')
  getTemplate(@Param('code') code: string) {
    return this.multiProjectTypeService.getTemplateForType(code);
  }
}
