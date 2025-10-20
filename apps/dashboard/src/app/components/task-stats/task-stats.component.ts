import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../services/task.service';

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  completionRate: number;
}

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-stats.component.html',
  styleUrls: ['./task-stats.component.css']
})
export class TaskStatsComponent implements OnInit {
  @Input() tasks: Task[] = [];
  
  stats: TaskStats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    completionRate: 0
  };

  ngOnInit() {
    this.calculateStats();
  }

  ngOnChanges() {
    this.calculateStats();
  }

  private calculateStats() {
    this.stats.total = this.tasks.length;
    this.stats.completed = this.tasks.filter(task => task.status === 'completed').length;
    this.stats.inProgress = this.tasks.filter(task => task.status === 'in_progress').length;
    this.stats.todo = this.tasks.filter(task => task.status === 'todo').length;
    this.stats.cancelled = this.tasks.filter(task => task.status === 'cancelled').length;
    
    this.stats.completionRate = this.stats.total > 0 
      ? Math.round((this.stats.completed / this.stats.total) * 100) 
      : 0;
  }

  getBarHeight(status: string): number {
    const max = Math.max(this.stats.completed, this.stats.inProgress, this.stats.todo, this.stats.cancelled);
    if (max === 0) return 0;
    
    switch (status) {
      case 'completed': return (this.stats.completed / max) * 100;
      case 'in_progress': return (this.stats.inProgress / max) * 100;
      case 'todo': return (this.stats.todo / max) * 100;
      case 'cancelled': return (this.stats.cancelled / max) * 100;
      default: return 0;
    }
  }

  getStatusColor(status: string): string {
    // Return the same color for all bars
    return '#3b82f6'; // Blue color for all bars
  }
}
