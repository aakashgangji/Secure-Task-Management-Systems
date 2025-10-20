import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'dashboard';

  constructor(private readonly themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme service on app startup
    this.themeService.listenForSystemThemeChanges();
    // Apply initial theme
    this.themeService.getCurrentTheme();
  }
}
