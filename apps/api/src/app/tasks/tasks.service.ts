import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, User, CreateTaskDto, UpdateTaskDto, AuditAction, AuditResource, TaskAssignment } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';
import { AuditLoggerService } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TaskAssignment)
    private readonly taskAssignmentRepository: Repository<TaskAssignment>,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Handle email-based assignment (legacy single assignment)
      let assignedToId: string | null = null;
      if (createTaskDto.assignedToEmail) {
        const assignedUser = await this.userRepository.findOne({ 
          where: { email: createTaskDto.assignedToEmail } 
        });
        if (!assignedUser) {
          throw new NotFoundException(`User with email ${createTaskDto.assignedToEmail} not found`);
        }
        assignedToId = assignedUser.id;
      }

      const task = this.taskRepository.create({
        ...createTaskDto,
        createdById: userId,
        assignedToId: assignedToId,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      });

      const savedTask = await this.taskRepository.save(task);

      // Handle multiple user assignments
      if (createTaskDto.assignedToEmails && createTaskDto.assignedToEmails.length > 0) {
        for (const email of createTaskDto.assignedToEmails) {
          const assignedUser = await this.userRepository.findOne({ 
            where: { email: email } 
          });
          if (!assignedUser) {
            throw new NotFoundException(`User with email ${email} not found`);
          }
          
          const taskAssignment = this.taskAssignmentRepository.create({
            taskId: savedTask.id,
            userId: assignedUser.id,
          });
          
          await this.taskAssignmentRepository.save(taskAssignment);
        }
      }

      // Log the task creation
      try {
        await this.auditLogger.log(
          AuditAction.CREATE,
          AuditResource.TASK,
          `Task created: ${savedTask.title}`,
          savedTask.id,
          userId,
        );
      } catch (error) {
        console.log('Audit logging failed:', error);
      }

      return savedTask;
    } catch (error) {
      console.error('Error in task creation:', error);
      throw error;
    }
  }

  async findAll(userId: string): Promise<Task[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is owner or admin (can see all tasks)
    const isOwnerOrAdmin = user.userRoles?.some(ur => 
      ur.role?.type === 'owner' || ur.role?.type === 'admin'
    );

    if (isOwnerOrAdmin) {
      return this.taskRepository.find({
        relations: ['createdBy', 'assignedTo', 'assignments', 'assignments.user'],
        order: { createdAt: 'DESC' },
      });
    }

    // Regular users can only see their own tasks or tasks assigned to them
    // We need to use a more complex query to include tasks assigned through the assignments table
    const tasks = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.assignments', 'assignments')
      .leftJoinAndSelect('assignments.user', 'assignmentUser')
      .where('task.createdById = :userId', { userId })
      .orWhere('task.assignedToId = :userId', { userId })
      .orWhere('assignments.userId = :userId', { userId })
      .orderBy('task.createdAt', 'DESC')
      .getMany();

    return tasks;
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['createdBy', 'assignedTo', 'assignments', 'assignments.user'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user has access to this task
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwnerOrAdmin = user.userRoles?.some(ur => 
      ur.role?.type === 'owner' || ur.role?.type === 'admin'
    );

    const isTaskOwner = task.createdById === userId;
    const isAssignedTo = task.assignedToId === userId;

    if (!isOwnerOrAdmin && !isTaskOwner && !isAssignedTo) {
      throw new ForbiddenException('Access denied to this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Check if user can update this task
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwnerOrAdmin = user.userRoles?.some(ur => 
      ur.role?.type === 'owner' || ur.role?.type === 'admin'
    );

    const isTaskOwner = task.createdById === userId;

    if (!isOwnerOrAdmin && !isTaskOwner) {
      throw new ForbiddenException('You can only update tasks you created');
    }

    // Handle email-based assignment for updates
    let assignedToId: string | null = task.assignedToId;
    if (updateTaskDto.assignedToEmail !== undefined) {
      if (updateTaskDto.assignedToEmail) {
        const assignedUser = await this.userRepository.findOne({ 
          where: { email: updateTaskDto.assignedToEmail } 
        });
        if (!assignedUser) {
          throw new NotFoundException(`User with email ${updateTaskDto.assignedToEmail} not found`);
        }
        assignedToId = assignedUser.id;
      } else {
        assignedToId = null; // Clear assignment if empty email
      }
    }

    const updatedTask = await this.taskRepository.save({
      ...task,
      ...updateTaskDto,
      assignedToId: assignedToId,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : task.dueDate,
      updatedAt: new Date(),
    });

    // Handle multiple user assignments for updates
    if (updateTaskDto.assignedToEmails !== undefined) {
      // Remove existing assignments
      await this.taskAssignmentRepository.delete({ taskId: id });
      
      // Add new assignments
      if (updateTaskDto.assignedToEmails && updateTaskDto.assignedToEmails.length > 0) {
        for (const email of updateTaskDto.assignedToEmails) {
          const assignedUser = await this.userRepository.findOne({ 
            where: { email: email } 
          });
          if (!assignedUser) {
            throw new NotFoundException(`User with email ${email} not found`);
          }
          
          const taskAssignment = this.taskAssignmentRepository.create({
            taskId: id,
            userId: assignedUser.id,
          });
          
          await this.taskAssignmentRepository.save(taskAssignment);
        }
      }
    }

    // Log the task update
    try {
      await this.auditLogger.log(
        AuditAction.UPDATE,
        AuditResource.TASK,
        `Task updated: ${updatedTask.title}`,
        updatedTask.id,
        userId,
      );
    } catch (error) {
      console.log('Audit logging failed:', error);
    }

    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);

    // Check if user can delete this task
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwnerOrAdmin = user.userRoles?.some(ur => 
      ur.role?.type === 'owner' || ur.role?.type === 'admin'
    );

    const isTaskOwner = task.createdById === userId;

    if (!isOwnerOrAdmin && !isTaskOwner) {
      throw new ForbiddenException('You can only delete tasks you created');
    }

    await this.taskRepository.remove(task);

    // Log the task deletion
    try {
      await this.auditLogger.log(
        AuditAction.DELETE,
        AuditResource.TASK,
        `Task deleted: ${task.title}`,
        task.id,
        userId,
      );
    } catch (error) {
      console.log('Audit logging failed:', error);
    }
  }
}
