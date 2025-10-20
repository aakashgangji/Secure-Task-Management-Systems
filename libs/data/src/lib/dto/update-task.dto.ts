import { IsString, IsOptional, IsEnum, IsDateString, IsEmail, IsArray } from 'class-validator';
import { TaskStatus, TaskPriority, TaskCategory } from '../task.entity';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsEnum(TaskCategory)
  category?: TaskCategory;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEmail()
  assignedToEmail?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  assignedToEmails?: string[];
}
