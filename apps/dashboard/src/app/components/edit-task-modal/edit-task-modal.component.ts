import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService, Task, UpdateTaskRequest } from '../../services/task.service';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-edit-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-task-modal.component.html',
  styleUrls: ['./edit-task-modal.component.css']
})
export class EditTaskModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() taskUpdated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  editTaskForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  users: User[] = [];
  loadingUsers = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly taskService: TaskService,
    private readonly usersService: UsersService
  ) {
    this.editTaskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['todo'],
      priority: ['medium'],
      category: ['work'],
      dueDate: [''],
      assignedToEmails: [[]]
    });
  }

  ngOnInit() {
    this.loadUsers();
    if (this.task) {
      this.populateForm();
    }
  }

  loadUsers() {
    this.loadingUsers = true;
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loadingUsers = false;
        this.errorMessage = 'Failed to load users. Please try again.';
      }
    });
  }

  private populateForm() {
    if (this.task) {
      this.editTaskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        status: this.task.status,
        priority: this.task.priority,
        category: this.task.category,
        dueDate: this.task.dueDate ? this.formatDateForInput(this.task.dueDate) : '',
        assignedToEmails: this.getAssignedUserEmails()
      });
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private getAssignedUserEmails(): string[] {
    if (!this.task) return [];
    
    // Get emails from new assignments array
    if (this.task.assignments && this.task.assignments.length > 0) {
      return this.task.assignments.map(assignment => assignment.user.email);
    }
    
    // Fallback to legacy assignedTo
    if (this.task.assignedTo?.email) {
      return [this.task.assignedTo.email];
    }
    
    return [];
  }

  onSubmit() {
    if (this.editTaskForm.valid && !this.isSubmitting && this.task) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = this.editTaskForm.value;
      const taskData: UpdateTaskRequest = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || undefined,
        assignedToEmails: formData.assignedToEmails || undefined
      };

      this.taskService.updateTask(this.task.id, taskData).subscribe({
        next: (updatedTask) => {
          this.taskUpdated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.errorMessage = error.error?.message || 'Failed to update task. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  closeModal() {
    this.editTaskForm.reset();
    this.errorMessage = '';
    this.isSubmitting = false;
    this.modalClosed.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
