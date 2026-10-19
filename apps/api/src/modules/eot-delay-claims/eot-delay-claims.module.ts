import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EotDelayClaimsService } from './eot-delay-claims.service';
import { EotDelayClaimsController } from './eot-delay-claims.controller';
import { DelayEvent } from './entities/delay-event.entity';
import { EOTClaim } from './entities/eot-claim.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DelayEvent, EOTClaim])],
    providers: [EotDelayClaimsService],
    controllers: [EotDelayClaimsController],
    exports: [EotDelayClaimsService]
})
export class EotDelayClaimsModule {}
