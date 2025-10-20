import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, CreateUserDto, Role, UserRole, RoleType, Task, AuditLog } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'email', 'firstName', 'lastName', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user with email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create the user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Assign roles if provided
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      for (const roleTypeString of createUserDto.roles) {
        // Cast string to RoleType enum
        const roleType = roleTypeString as RoleType;
        const role = await this.roleRepository.findOne({
          where: { type: roleType }
        });
        
        if (role) {
          const userRole = this.userRoleRepository.create({
            userId: savedUser.id,
            roleId: role.id,
          });
          await this.userRoleRepository.save(userRole);
        }
      }
    }

    // Return user without password
    const { password, ...result } = savedUser;
    return result;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete related records first to avoid foreign key constraints
    // 1. Delete user roles
    await this.userRoleRepository.delete({ userId: id });

    // 2. Update tasks created by this user (set createdById to null or another user)
    await this.taskRepository.update(
      { createdById: id },
      { createdById: null }
    );

    // 3. Update tasks assigned to this user (set assignedToId to null)
    await this.taskRepository.update(
      { assignedToId: id },
      { assignedToId: null }
    );

    // 4. Delete audit logs for this user
    await this.auditLogRepository.delete({ userId: id });

    // 5. Now delete the user
    await this.userRepository.remove(user);
  }
}
