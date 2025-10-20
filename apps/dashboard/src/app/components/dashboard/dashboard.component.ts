import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { AddTaskModalComponent } from '../add-task-modal/add-task-modal.component';
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';
import { TaskStatsComponent } from '../task-stats/task-stats.component';
import { KeyboardShortcutsComponent } from '../keyboard-shortcuts/keyboard-shortcuts.component';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AddTaskModalComponent, EditTaskModalComponent, TaskStatsComponent, KeyboardShortcutsComponent, ThemeToggleComponent, CdkDrag, CdkDropList],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  selectedStatus = '';
  selectedPriority = '';
  selectedCategory = '';
  
  // Drag and drop - organize tasks by status
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  completedTasks: Task[] = [];
  cancelledTasks: Task[] = [];
  
  // Modal state
  showAddTaskModal = false;
  showEditTaskModal = false;
  showKeyboardShortcuts = false;
  selectedTask: Task | null = null;

  constructor(
    public authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Initialize theme service
    this.themeService.listenForSystemThemeChanges();
    
    // Subscribe to user changes to handle page reload
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTasks();
      }
    });
    
    // Also get current user immediately in case it's already loaded
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadTasks();
    }
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        // Check if user is owner or admin (should see all tasks)
        const isOwnerOrAdmin = this.currentUser?.roles?.includes('owner') || this.currentUser?.roles?.includes('admin');
        
        if (isOwnerOrAdmin) {
          // Owners and admins see all tasks
          this.tasks = tasks;
        } else if (this.currentUser) {
          // Regular users see only their own tasks or tasks assigned to them
          this.tasks = tasks.filter(task => {
            const isCreatedBy = task.createdBy?.id === this.currentUser?.id;
            const isAssignedTo = task.assignedTo?.id === this.currentUser?.id;
            const isAssignedThroughAssignments = task.assignments?.some(assignment => assignment.user.id === this.currentUser?.id);
            
            return isCreatedBy || isAssignedTo || isAssignedThroughAssignments;
          });
        } else {
          this.tasks = tasks;
        }
        
        this.filteredTasks = this.tasks;
        this.organizeTasksByStatus();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  organizeTasksByStatus() {
    this.todoTasks = this.filteredTasks.filter(task => task.status === 'todo');
    this.inProgressTasks = this.filteredTasks.filter(task => task.status === 'in_progress');
    this.completedTasks = this.filteredTasks.filter(task => task.status === 'completed');
    this.cancelledTasks = this.filteredTasks.filter(task => task.status === 'cancelled');
  }

  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const statusMatch = !this.selectedStatus || task.status === this.selectedStatus;
      const priorityMatch = !this.selectedPriority || task.priority === this.selectedPriority;
      const categoryMatch = !this.selectedCategory || task.category === this.selectedCategory;
      return statusMatch && priorityMatch && categoryMatch;
    });
    this.organizeTasksByStatus();
  }

  onTaskDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving between different status lists
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      
      // Update task status
      this.updateTaskStatus(task, newStatus);
      
      // Move item between lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  getStatusFromContainerId(containerId: string): string {
    switch (containerId) {
      case 'todo-list': return 'todo';
      case 'in-progress-list': return 'in_progress';
      case 'completed-list': return 'completed';
      case 'cancelled-list': return 'cancelled';
      default: return 'todo';
    }
  }

  updateTaskStatus(task: Task, newStatus: string) {
    const updateData = { ...task, status: newStatus as any };
    this.taskService.updateTask(task.id, updateData).subscribe({
      next: (updatedTask) => {
        // Update the task in the main tasks array
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        // Refresh the filtered tasks and reorganize by status
        this.filteredTasks = this.tasks;
        this.organizeTasksByStatus();
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        // Revert the change on error
        this.loadTasks();
      }
    });
  }

  openCreateModal() {
    this.showAddTaskModal = true;
  }

  editTask(task: Task) {
    this.selectedTask = task;
    this.showEditTaskModal = true;
  }

  onTaskCreated() {
    this.showAddTaskModal = false;
    this.loadTasks();
  }

  onTaskUpdated() {
    this.showEditTaskModal = false;
    this.selectedTask = null;
    this.loadTasks();
  }

  onAddModalClosed() {
    this.showAddTaskModal = false;
  }

  onEditModalClosed() {
    this.showEditTaskModal = false;
    this.selectedTask = null;
  }

  openKeyboardShortcuts() {
    this.showKeyboardShortcuts = true;
  }

  onKeyboardShortcutsClosed() {
    this.showKeyboardShortcuts = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    // Only handle shortcuts when no modal is open and no input is focused
    if (this.showAddTaskModal || this.showEditTaskModal) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    // Ctrl/Cmd + N: New Task
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      if (this.authService.canCreateTasks()) {
        this.openCreateModal();
      }
    }


    // Ctrl/Cmd + A: Audit Log (Owner/Admin only)
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      if (this.currentUser?.roles?.includes('owner') || this.currentUser?.roles?.includes('admin')) {
        this.router.navigate(['/audit-log']);
      }
    }

    // Ctrl/Cmd + ?: Keyboard Shortcuts Help
    if ((event.ctrlKey || event.metaKey) && event.key === '?') {
      event.preventDefault();
      this.openKeyboardShortcuts();
    }

    // Escape: Close any open modals
    if (event.key === 'Escape') {
      if (this.showAddTaskModal) {
        this.onAddModalClosed();
      }
      if (this.showEditTaskModal) {
        this.onEditModalClosed();
      }
    }
  }

  deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  canEditTask(task: Task): boolean {
    return this.authService.isOwner() || this.authService.isAdmin() || 
           (!!this.currentUser && task.createdBy?.id === this.currentUser.id);
  }

  canDeleteTask(task: Task): boolean {
    return this.authService.isOwner() || this.authService.isAdmin() || 
           (!!this.currentUser && task.createdBy?.id === this.currentUser.id);
  }

  logout() {
    this.authService.logout();
  }

  getRoleText(): string {
    if (this.currentUser?.roles?.includes('owner')) return 'Owner';
    if (this.currentUser?.roles?.includes('admin')) return 'Admin';
    return 'Viewer';
  }

  getRoleBadgeClass(): string {
    if (this.currentUser?.roles?.includes('owner')) return 'role-badge owner';
    if (this.currentUser?.roles?.includes('admin')) return 'role-badge admin';
    return 'role-badge viewer';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  }

  getStatusBadgeClass(status: string): string {
    return `status-badge ${status.replace('_', '-')}`;
  }

  getPriorityText(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent'
    };
    return priorityMap[priority] || priority;
  }

  getPriorityBadgeClass(priority: string): string {
    return `priority-badge ${priority}`;
  }

  getCategoryText(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'work': 'Work',
      'personal': 'Personal',
      'project': 'Project',
      'meeting': 'Meeting'
    };
    return categoryMap[category] || category;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

}