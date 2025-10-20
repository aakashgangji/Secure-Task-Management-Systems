import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme-preference';
  private readonly themeSubject = new BehaviorSubject<Theme>('light');
  private currentTheme: Theme = 'light';

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Get saved theme preference from localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Check browser preference for initial setup
      this.currentTheme = this.getSystemTheme();
    }
    
    this.applyTheme();
    this.themeSubject.next(this.currentTheme);
  }

  getTheme(): Observable<Theme> {
    return this.themeSubject.asObservable();
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
    this.themeSubject.next(theme);
  }

  private applyTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light-theme', 'dark-theme');
    
    // Add the current theme class
    root.classList.add(`${effectiveTheme}-theme`);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (globalThis.window?.matchMedia) {
      return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // fallback
  }

  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a1a1a' : '#ffffff');
    }
  }

  // Listen for system theme changes (for initial setup only)
  listenForSystemThemeChanges(): void {
    // This method is kept for compatibility but no longer needed
    // since we removed system theme option
  }

  // Get the current effective theme (light or dark)
  getEffectiveThemeValue(): 'light' | 'dark' {
    return this.getEffectiveTheme();
  }
}
