import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService, CreateUserRequest } from '../../services/users.service';

@Component({
  selector: 'app-create-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.css']
})
export class CreateUserModalComponent implements OnInit {
  @Output() userCreated = new EventEmitter<void>();
  @Output() modalClosed = new EventEmitter<void>();

  createUserForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  availableRoles = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' }
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly usersService: UsersService
  ) {
    this.createUserForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      roles: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Component initialization - form is already set up in constructor
    // No additional initialization needed
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onRoleChange(event: any, roleValue: string) {
    // For radio buttons, simply set the selected role
    this.createUserForm.get('roles')?.setValue(roleValue);
  }

  onSubmit() {
    if (this.createUserForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = this.createUserForm.value;
      const userData: CreateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        roles: formData.roles ? [formData.roles] : []
      };

      this.usersService.createUser(userData).subscribe({
        next: (user) => {
          this.userCreated.emit();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = error.error?.message || 'Failed to create user. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  closeModal() {
    this.createUserForm.reset();
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
