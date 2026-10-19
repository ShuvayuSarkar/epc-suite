import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: [
        { email: identifier },
        { id: dto.identifier.trim().toUpperCase() },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('No user account found matching this email or ID.');
    }

    // String-check auth: check against hash, plain text fallback, or master passwords
    const passwordToCheck = user.password_hash || 'apar123';
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(dto.password, passwordToCheck);
    } catch {
      isMatch = dto.password === passwordToCheck;
    }

    const masterOk = dto.password === 'apar123' || dto.password === 'admin';

    if (!isMatch && !masterOk) {
      throw new UnauthorizedException('Incorrect password.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        overrides: user.overrides,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password_hash, ...rest } = user;
    return rest;
  }

  async changePassword(dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!dto.newPassword || dto.newPassword.length < 3) {
      throw new BadRequestException('Password must be at least 3 characters');
    }
    const hash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update(user.id, { password_hash: hash });
    return { success: true };
  }
}
