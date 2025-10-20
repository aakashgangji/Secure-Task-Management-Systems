import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User as AuthUser } from '../../services/auth.service';
import { UsersService, User } from '../../services/users.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { CreateUserModalComponent } from '../create-user-modal/create-user-modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent, CreateUserModalComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  currentUser: AuthUser | null = null;
  users: User[] = [];
  loading = false;
  error = '';
  authLoading = true;
  showCreateUserModal = false;
  private readonly userSubscription?: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    // First check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      // User data is available immediately
      this.authLoading = false;
      this.checkPermissionsAndLoad();
    } else {
      // User data not available, try to load it
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.currentUser = user;
          this.authLoading = false;
          this.checkPermissionsAndLoad();
        },
        error: (error) => {
          console.error('Error loading profile in user management component:', error);
          this.authLoading = false;
          if (error.status === 401 || error.status === 403) {
            this.router.navigate(['/login']);
          } else {
            // For other errors, show error message but don't redirect
            this.error = 'Failed to load user profile. Please try refreshing the page.';
          }
        }
      });
    }
  }

  private checkPermissionsAndLoad() {
    // Check if user has permission to manage users
    if (!this.canManageUsers()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
  }

  canManageUsers(): boolean {
    return !!(this.currentUser?.roles?.includes('admin'));
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.error = 'Failed to load users. Please try again.';
      }
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"? This action cannot be undone.`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        // Remove user from local array
        this.users = this.users.filter(u => u.id !== user.id);
        this.loading = false;
        console.log('User deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.loading = false;
        this.error = error.error?.message || 'Failed to delete user. Please try again.';
      }
    });
  }

  getRoleText(user: User): string {
    const roles = user.userRoles?.map(ur => ur.role?.type) || [];
    if (roles.includes('owner')) return 'Owner';
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('viewer')) return 'Viewer';
    return 'No Role';
  }

  getRoleClass(user: User): string {
    const roles = user.userRoles?.map(ur => ur.role?.type) || [];
    if (roles.includes('owner')) return 'role-owner';
    if (roles.includes('admin')) return 'role-admin';
    if (roles.includes('viewer')) return 'role-viewer';
    return 'role-none';
  }

  canDeleteUser(user: User): boolean {
    // Don't allow deleting yourself
    return user.id !== this.currentUser?.id;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Create User Modal Methods
  openCreateUserModal() {
    this.showCreateUserModal = true;
  }

  onUserCreated() {
    this.showCreateUserModal = false;
    this.loadUsers(); // Refresh the user list
  }

  onCreateUserModalClosed() {
    this.showCreateUserModal = false;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
