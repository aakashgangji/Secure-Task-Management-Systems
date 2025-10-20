import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AuditLogService } from '../../services/audit-log.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { Subscription } from 'rxjs';

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent],
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  auditLogs: AuditLog[] = [];
  loading = false;
  error = '';
  authLoading = true;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private auditLogService: AuditLogService,
    private router: Router
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
          console.error('Error loading profile in audit log component:', error);
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
    // Check if user has permission to view audit logs
    if (!this.canViewAuditLogs()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadAuditLogs();
  }

  canViewAuditLogs(): boolean {
    return !!(this.currentUser?.roles?.includes('owner') || this.currentUser?.roles?.includes('admin'));
  }

  loadAuditLogs() {
    this.loading = true;
    this.error = '';
    
    this.auditLogService.getAuditLogs().subscribe({
      next: (logs) => {
        this.auditLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.error = 'Failed to load audit logs. Please try again.';
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  getActionText(action: string): string {
    const actionMap: { [key: string]: string } = {
      'create': 'Created',
      'read': 'Viewed',
      'update': 'Updated',
      'delete': 'Deleted',
      'login': 'Logged In',
      'logout': 'Logged Out'
    };
    return actionMap[action] || action;
  }

  getResourceText(resource: string): string {
    const resourceMap: { [key: string]: string } = {
      'task': 'Task',
      'user': 'User',
      'audit_log': 'Audit Log'
    };
    return resourceMap[resource] || resource;
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
