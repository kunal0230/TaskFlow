# TaskFlow

A smart, feature-rich task management web application with a beautiful UI, theming, calendar view, and local storage persistence.

![TaskFlow Demo](https://img.shields.io/badge/Version-1.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Active-success)

> **Note:** I built TaskFlow for my own personal productivity. It is free for anyone to use. Active deployment is available on Vercel. **Privacy First:** All data is stored locally in your browser (Local Storage). No information is sent to any server, ensuring your tasks remain completely private and secure.

## Features

### Core Functionality

- **Advanced Task Management**
  - Create, edit, delete, and duplicate tasks with ease
  - Set priority levels (High, Medium, Low) with distinct visual indicators
  - Define due dates and track overdue status
  - Organize tasks into custom, color-coded categories
  - Break down complex items into subtasks with progress tracking

- **Interactive Day Planner**
  - dedicated timeline view for daily scheduling (06:00 AM - 12:00 AM)
  - Drag-and-drop tasks from unscheduled sidebar to timeline
  - Adjust task duration by dragging the bottom edge of task cards
  - Visual time marker indicating current time
  - Auto-scrolling to current time on open

- **Focus Mode (Spotlight)**
  - Toggle "Focus Mode" to minimize distractions
  - Active task (based on current time) remains fully highlighted
  - Inactive tasks are dimmed to reduce visual noise
  - Hovering over dimmed tasks temporarily restores visibility for quick reference

- **Smart Auto-Scheduling**
  - One-click "Auto-Schedule" feature to intelligently place unscheduled tasks
  - Optimization algorithm prioritizes tasks by urgency and duration
  - Automatically identifies and fills empty time slots in your day

### User Interface & Experience

- **Views & Navigation**
  - **List View:** Traditional vertical task list with robust filtering
  - **Calendar View:** Monthly overview for long-term planning
  - **Day Planner:** Granular hourly view for daily execution

- **Customization**
  - **Themes:** Toggable Dark and Light modes
  - **Accent Colors:** Six professional color schemes (Purple, Blue, Green, Orange, Pink, Red)
  - **Layout:** Responsive design that adapts to various screen sizes

### Technical & Utility

- **Data Persistence:** Robust local storage implementation ensures data safety
- **Shortcuts:** Comprehensive keyboard shortcuts for power users
- **Search:** Real-time filtered search across all tasks
- **Export/Import:** JSON-based data export for backups or migration
- **Notifications:** Non-intrusive toast notifications for user actions

## Quick Start

### Option 1: Direct Open

Simply open `index.html` in any modern browser.

### Option 2: Local Server (Recommended)

```bash
# Clone the repository
git clone https://github.com/kunal0230/TaskFlow.git
cd TaskFlow

# Serve with any static server
npx serve . -p 3000

# Open in browser
open http://localhost:3000
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Create new task |
| `/` | Focus search bar |
| `T` | Toggle dark/light theme |
| `C` | Toggle calendar view |
| `Esc` | Close modals |

## Usage Guide

### Getting Started

1. **Create Account** - Sign up with username and password
2. **Add Task** - Click "Add Task" or press `N`
3. **Set Priority** - Choose High, Medium, or Low
4. **Add Due Date** - Optional deadline for the task
5. **Add Subtasks** - Break down complex tasks

### Using Categories

1. Click the `+` button in the Categories section
2. Enter a name and pick a color
3. Assign category when creating/editing tasks
4. Click category to filter tasks

### Calendar View

1. Click the calendar icon (or press `C`)
2. Navigate months with arrows
3. Click a date to see/add tasks
4. Tasks appear as colored items on day cells

### Export/Import

1. Click settings icon (⚙️)
2. "Export Tasks" downloads JSON file
3. "Import Tasks" loads from JSON file

## Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Custom properties, Flexbox, Grid
- **Vanilla JavaScript** - No frameworks
- **Local Storage** - Data persistence

## Project Structure

```
TaskFlow/
├── index.html      # Main HTML file
├── styles.css      # All styles with theme variables
├── app.js          # Application logic
└── README.md       # This file
```

## Data Storage

All data is stored in browser's localStorage:

- `taskflow_accounts` - User accounts
- `taskflow_current_user` - Active session
- `taskflow_tasks_<user>` - User's tasks
- `taskflow_categories_<user>` - User's categories
- `taskflow_theme` - Theme preference
- `taskflow_accent` - Accent color preference

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Kunal Chaugule**

- GitHub: [@kunal0230](https://github.com/kunal0230)

---

>
