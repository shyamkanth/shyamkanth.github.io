# BotBook : A Minimal Note Companion

A sleek, browser-based notebook built with HTML, CSS, and JavaScript that lets you create, edit, and manage notes effortlessly. Your notes are stored locally in your browser using `localStorage`, ensuring privacy and persistence across sessions.

## Features

- **Minimalist Design**: Clean, dark-themed interface with Material Symbols icons
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Real-time Auto-save**: Notes save automatically as you type
- **Multiple Notes**: Create and manage unlimited notes
- **Edit & Rename**: Modify note content and titles anytime
- **Delete Notes**: Remove notes with confirmation
- **Export/Import**: Backup and restore notes as JSON files
- **Keyboard Shortcuts**: Quick actions for power users
- **Privacy-First**: All data stays local in your browser

## How to Use

1. **Creating a Note**
   - Click the "New Note" button or press `Ctrl + M` to create a new note.
2. **Editing a Note**
   - Click on any note in the sidebar to open it in the editor.
   - Modify the content directly in the editor area.
   - Click the edit icon next to a note title to rename it.
3. **Saving a Note**
   - Notes auto-save every second as you type. No manual saving needed.

4. **Deleting a Note**
   - Click the delete icon on a note or use the delete button in the editor.

5. **Exporting Notes**
   - Export individual notes or all notes as JSON files.

6. **Importing Notes**
   - Import previously exported JSON files to restore notes.

## Keyboard Shortcuts

- `Ctrl + M`: Create a new note
- `Ctrl + E`: Export all notes
- `Ctrl + I`: Import notes
- `Ctrl + S`: Manual save (though auto-save is active)

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom styling with CSS variables and responsive design
- **JavaScript (ES6+)**: Note management, localStorage, and DOM manipulation
- **Material Symbols**: Google Fonts icons for UI elements
- **localStorage**: Client-side data persistence

## Privacy & Data

All your notes are stored exclusively in your browser's localStorage. No data is sent to any server or collected by the developer. Your privacy is fully protected.

## Installation & Usage

1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start creating notes!

## Browser Compatibility

Works in all modern browsers that support:

- ES6 JavaScript features
- CSS Grid and Flexbox
- localStorage API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material Symbols by Google Fonts
- Plus Jakarta Sans and JetBrains Mono fonts
- Inspired by minimal productivity tools
