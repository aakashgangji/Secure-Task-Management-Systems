import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService, CreateTaskRequest } from '../../services/task.service';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task-modal.component.html',
  styleUrls: ['./add-task-modal.component.css']
})
export class AddTaskModalComponent implements OnInit {
  @Output() taskCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  addTaskForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  users: User[] = [];
  loadingUsers = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly taskService: TaskService,
    private readonly usersService: UsersService
  ) {
    this.addTaskForm = this.formBuilder.group({
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

  onSubmit() {
    if (this.addTaskForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = this.addTaskForm.value;
      const taskData: CreateTaskRequest = {
        title: formData.title,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || undefined,
        assignedToEmails: formData.assignedToEmails || undefined
      };

      this.taskService.createTask(taskData).subscribe({
        next: (task) => {
          this.taskCreated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating task:', error);
          this.errorMessage = error.error?.message || 'Failed to create task. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  closeModal() {
    this.addTaskForm.reset();
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
