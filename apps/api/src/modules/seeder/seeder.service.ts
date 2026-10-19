import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/entities/user.entity';
import { RbacRoleMatrix } from '../rbac/entities/rbac-role-matrix.entity';

// All 23 default users from the frontend MOCK_USERS
const DEFAULT_USERS = [
  { id: 'U001', name: 'Rajesh Kumar',    email: 'rajesh@aparind.com',   password: 'admin',      role: 'system_admin',         department: 'IT'           },
  { id: 'U002', name: 'Sunil Verma',     email: 'sunil@aparind.com',    password: 'sunil123',   role: 'project_director',     department: 'Management'   },
  { id: 'U003', name: 'Priya Sharma',    email: 'priya@aparind.com',    password: 'priya123',   role: 'project_manager',      department: 'Projects'     },
  { id: 'U004', name: 'Amit Patel',      email: 'amit@aparind.com',     password: 'amit123',    role: 'bid_manager',          department: 'Marketing'    },
  { id: 'U005', name: 'Neha Gupta',      email: 'neha@aparind.com',     password: 'neha123',    role: 'finance_controller',   department: 'Finance'      },
  { id: 'U006', name: 'Vikram Singh',    email: 'vikram@aparind.com',   password: 'vikram123',  role: 'lead_design_engineer', department: 'Engineering'  },
  { id: 'U007', name: 'Ravi Tiwari',     email: 'ravi@aparind.com',     password: 'ravi123',    role: 'vendor_manager',       department: 'Procurement'  },
  { id: 'U008', name: 'Deepa Nair',      email: 'deepa@aparind.com',    password: 'deepa123',   role: 'quality_inspector',    department: 'QA/QC'        },
  { id: 'U009', name: 'Manoj Desai',     email: 'manoj@aparind.com',    password: 'manoj123',   role: 'store_manager',        department: 'Stores'       },
  { id: 'U010', name: 'Suresh Yadav',    email: 'suresh@aparind.com',   password: 'suresh123',  role: 'gang_supervisor',      department: 'Installation' },
  { id: 'U011', name: 'Anita Reddy',     email: 'anita@aparind.com',    password: 'anita123',   role: 'safety_hse_officer',   department: 'HSE'          },
  { id: 'U012', name: 'Prakash Joshi',   email: 'prakash@aparind.com',  password: 'prakash123', role: 'hr_manager',           department: 'HR'           },
  { id: 'U013', name: 'Kavita Iyer',     email: 'kavita@aparind.com',   password: 'kavita123',  role: 'claims_manager',       department: 'Contracts'    },
  { id: 'U014', name: 'Rahul Mehta',     email: 'rahul@aparind.com',    password: 'rahul123',   role: 'contract_manager',     department: 'Contracts'    },
  { id: 'U015', name: 'Pooja Saxena',    email: 'pooja@aparind.com',    password: 'pooja123',   role: 'document_controller',  department: 'Documentation'},
  { id: 'U016', name: 'NTPC Client Rep', email: 'rep@ntpc.co.in',       password: 'client123',  role: 'client_stakeholder',   department: 'Client'       },
  { id: 'U017', name: 'Sanjay Kapoor',   email: 'sanjay@aparind.com',   password: 'sanjay123',  role: 'sales_executive',      department: 'Sales'        },
  { id: 'U018', name: 'Arun Mishra',     email: 'arun@aparind.com',     password: 'arun123',    role: 'survey_team',          department: 'Survey'       },
  { id: 'U019', name: 'Dinesh Thapar',   email: 'dinesh@aparind.com',   password: 'dinesh123',  role: 'plant_manager',        department: 'Manufacturing'},
  { id: 'U020', name: 'Meera Pillai',    email: 'meera@aparind.com',    password: 'meera123',   role: 'compliance_officer',   department: 'Compliance'   },
  { id: 'U021', name: 'Gaurav Chawla',   email: 'gaurav@aparind.com',   password: 'gaurav123',  role: 'treasury_manager',     department: 'Treasury'     },
  { id: 'U022', name: 'Akash Dubey',     email: 'akash@aparind.com',    password: 'akash123',   role: 'legal_contracts',      department: 'Legal'        },
  { id: 'U023', name: 'Shuv Sarkar',     email: 'shuv@aparind.com',     password: 'shuv123',    role: 'vendor_manager',       department: 'Distributor'  },
];

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RbacRoleMatrix)
    private readonly matrixRepo: Repository<RbacRoleMatrix>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
  }

  private async seedUsers() {
    try {
      const count = await this.userRepo.count();
      if (count > 0) {
        this.logger.log(`Skipping user seed — ${count} users already exist.`);
        return;
      }

      this.logger.log('Seeding default users...');
      for (const u of DEFAULT_USERS) {
        const hash = await bcrypt.hash(u.password, 10);
        const user = this.userRepo.create({
          id: u.id,
          name: u.name,
          email: u.email,
          password_hash: hash,
          role: u.role as any,
          department: u.department,
          overrides: {},
        });
        await this.userRepo.save(user);
      }
      this.logger.log(`✅ Seeded ${DEFAULT_USERS.length} users successfully.`);
    } catch (err: any) {
      this.logger.warn(`Could not seed users: ${err.message}`);
    }
  }
}
