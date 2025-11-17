// darkMode.js - Complete Dark Mode Implementation

class DarkMode {
  constructor() {
    this.theme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    this.createStyles();
    this.applyTheme(this.theme);
    this.setupEventListeners();
  }

  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --bg-primary: #ffffff;
        --bg-secondary: #f8f9fa;
        --text-primary: #333333;
        --text-secondary: #666666;
        --border-color: #e1e5e9;
        --shadow: 0 2px 4px rgba(0,0,0,0.1);
        --transition: all 0.3s ease;
      }

      [data-theme="dark"] {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --text-primary: #e0e0e0;
        --text-secondary: #b0b0b0;
        --border-color: #404040;
        --shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      * {
        transition: var(--transition);
      }

      body {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Common element styles */
      .card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 20px;
        margin: 20px;
        box-shadow: var(--shadow);
      }

      .header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border-color);
        padding: 16px;
      }

      .button {
        background: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        transition: var(--transition);
      }

      .button:hover {
        background: var(--border-color);
      }

      input, textarea {
        background: var(--bg-primary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        padding: 8px;
        border-radius: 4px;
      }

      input:focus, textarea:focus {
        outline: none;
        border-color: var(--text-secondary);
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });

    // Keyboard shortcut (Ctrl/Cmd + Shift + L)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.theme);
    this.storeTheme(this.theme);
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
  }

  getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  storeTheme(theme) {
    localStorage.setItem('theme', theme);
  }

  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  getSunIcon() {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
      </svg>
    `;
  }

  getMoonIcon() {
    return `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
      </svg>
    `;
  }

  // Public methods for external use
  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.theme = theme;
      this.applyTheme(theme);
      this.storeTheme(theme);
    }
  }

  getCurrentTheme() {
    return this.theme;
  }
}

// Initialize dark mode when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.darkMode = new DarkMode();
  });
} else {
  window.darkMode = new DarkMode();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DarkMode;
}
 