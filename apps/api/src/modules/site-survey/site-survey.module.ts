import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSurvey } from './entities/site-survey.entity';
import { Project } from '../../database/entities/project.entity';
import { SiteSurveyService } from './site-survey.service';
import { SiteSurveyController } from './site-survey.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSurvey, Project])],
  controllers: [SiteSurveyController],
  providers: [SiteSurveyService],
  exports: [SiteSurveyService],
})
export class SiteSurveyModule {}
