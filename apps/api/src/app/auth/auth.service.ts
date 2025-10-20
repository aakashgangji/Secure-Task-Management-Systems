import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, LoginDto, CreateUserDto } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';
import { AuditLoggerService } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.userRoles?.map(ur => ur.role?.type) || [],
    };

    const token = this.jwtService.sign(payload);

    // Log the login attempt
    await this.auditLogger.log(
      'login' as any,
      'auth' as any,
      `User ${user.email} logged in`,
      user.id,
      user.id,
      ipAddress,
      userAgent,
    );

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.userRoles?.map(ur => ur.role?.type) || [],
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Log the registration
    await this.auditLogger.log(
      'create' as any,
      'user' as any,
      `New user registered: ${savedUser.email}`,
      savedUser.id,
      savedUser.id,
    );

    const { password, ...result } = savedUser;
    return result;
  }

  async logout(userId: string, ipAddress?: string, userAgent?: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (user) {
      // Log the logout
      await this.auditLogger.log(
        'logout' as any,
        'auth' as any,
        `User ${user.email} logged out`,
        user.id,
        user.id,
        ipAddress,
        userAgent,
      );
    }

    return { message: 'Logged out successfully' };
  }

  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
    });
  }
}
