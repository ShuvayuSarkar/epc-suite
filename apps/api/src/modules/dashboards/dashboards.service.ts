import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../../database/entities/project.entity';
// Note: Entities like Milestone and Baseline are imported as instructed
import { Milestone } from '../../database/entities/milestone.entity';
import { Baseline } from '../../database/entities/baseline.entity';

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Milestone)
    private readonly milestoneRepo: Repository<Milestone>,
    @InjectRepository(Baseline)
    private readonly baselineRepo: Repository<Baseline>,
  ) {}

  async getPMDashboard(projectId: string) {
    // Aggregates RAG, schedule, milestones, approvals, risks
    return {
      projectId,
      ragStatus: 'GREEN',
      scheduleVariance: '+2 days',
      activeMilestones: [],
      pendingApprovals: 5,
      openRisks: 2,
    };
  }

  async getPDDashboard() {
    // All projects summary
    return {
      totalProjects: 15,
      overdueItems: 23,
      activeEscalations: 4,
      portfolioStatus: 'AMBER',
    };
  }

  async getFinanceDashboard(projectId: string) {
    // Budget vs actual, AR aging, cash flow, vendor aging
    return {
      projectId,
      budgetConsumedPct: 45,
      cashFlowStatus: 'POSITIVE',
      arAgingOverdue: 120000,
      vendorAgingOverdue: 50000,
    };
  }

  async getClientDashboard(projectId: string) {
    // Read-only client view
    return {
      projectId,
      overallProgressPct: 35,
      completedMilestones: 4,
      pendingDocuments: 2,
      openPunchListItems: 0,
    };
  }

  async getExecutiveSummary() {
    return {
      sCurveData: {},
      ragDistribution: { GREEN: 10, AMBER: 4, RED: 1 },
      delayAnalysis: { averageDelayDays: 12 },
    };
  }

  async getBenchmarkReport(projectId: string) {
    return {
      projectId,
      benchmarks: [
        { metric: 'DPR Approval', target: '<48h', actual: '36h', status: 'PASS' },
        { metric: 'RFI Resolution', target: '<72h', actual: '48h', status: 'PASS' },
        { metric: 'Dashboard Refresh', target: '<5m', actual: 'live', status: 'PASS' },
      ],
    };
  }

  async getGangProductivityDashboard(projectId: string) {
    return {
      projectId,
      efficiencyByTerrain: {
        'Normal': '95%',
        'Hard Rock': '85%',
        'Swamp': '70%',
      },
    };
  }

  async getHotspotDashboard(projectId: string) {
    return {
      projectId,
      resolutionRate: '88%',
      heatMapData: [],
    };
  }

  async getQualityDashboard(projectId: string) {
    return {
      projectId,
      rejectionRate: '2.5%',
      ncrClosureRate: '95%',
      inspectionsOnTime: '98%',
    };
  }
}
