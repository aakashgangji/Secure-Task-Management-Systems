import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, PermissionAction, PermissionResource } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/data';
import { JwtAuthGuard, RbacGuard, RequirePermissions } from '@faakash-BCA45B59-B747-4568-9BC5-94422F6F4984/auth';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.TASK })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.TASK })
  findAll(@Request() req) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.TASK })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.TASK })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RbacGuard)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.TASK })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }
}
