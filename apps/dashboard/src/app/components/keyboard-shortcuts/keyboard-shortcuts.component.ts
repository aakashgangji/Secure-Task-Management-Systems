import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyboard-shortcuts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './keyboard-shortcuts.component.html',
  styleUrls: ['./keyboard-shortcuts.component.css']
})
export class KeyboardShortcutsComponent {
  @Output() modalClosed = new EventEmitter<void>();

  shortcuts = [
    {
      key: 'Ctrl/Cmd + N',
      description: 'Create new task',
      available: 'All users with create permission'
    },
    {
      key: 'Ctrl/Cmd + A',
      description: 'Open audit logs',
      available: 'Owner and Admin only'
    },
    {
      key: 'Escape',
      description: 'Close modal or cancel action',
      available: 'All users'
    },
    {
      key: 'Drag & Drop',
      description: 'Move tasks between status columns',
      available: 'All users with edit permission'
    }
  ];

  closeModal() {
    this.modalClosed.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
