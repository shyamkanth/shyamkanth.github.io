# 📚 Lexica — A Private Linguistic Vault

> **"Today's language is tomorrow's literature."** — *Shyam Sunder Kanth*

Lexica is a minimalist, **localStorage-powered** personal dictionary built with pure Vanilla JavaScript. Designed for writers, students, and language lovers, it serves as a private archive for curating a collection of words, definitions, pronunciations, and contextual examples—no backend required.

---

## ✨ Key Features

- **Personalized Lexicon**: Build a private database of words with custom definitions, pronunciations, and etymological notes.
- **Categorization & Tagging**: Organize words by parts of speech (Noun, Verb, Adjective, Adverb) or custom categories.
- **Dynamic Dashboard**: Track your linguistic growth with real-time statistics including total words, weekly additions, and favorite count.
- **Curated Artifact (Word of the Day)**: Automatically resurface words from your own collection in a beautiful "Word of the Day" format.
- **Advanced Search & Filtering**: Navigate your lexicon with a powerful search bar and multiple filtering options (Category, Sort by A-Z/Newest, Favorites).
- **Live Activity Log**: A detailed log records every linguistic discovery and modification you make.
- **Data Portability**: Full support for JSON import and export, ensuring your personal dictionary is always portable and secure.
- **Premium Responsive Design**: A refined, dark-themed interface that adapts perfectly to desktop sidebars and mobile bottom-nav layouts.
- **Privacy First**: Completely static and serverless—your data lives exclusively in your browser's `localStorage`.

---

## 🛠️ Tech Stack

Lexica is built with a focus on simplicity, performance, and durability:

- **Core**: Vanilla HTML5, CSS3, and ES6+ JavaScript
- **State Management**: Custom-built `localStorage` wrapper for persistent storage
- **Icons**: [Material Symbols Outlined](https://fonts.google.com/icons)
- **Architecture**: Multi-page static application with shared global scripts
- **Styling**: Pure CSS (no Tailwind or external UI frameworks)

---

## 🚀 Getting Started

Since Lexica is a fully static application, there are no dependencies to install and no build steps required.

1. Clone the repository.
2. Navigate to `projects/lexica`.
3. Open `index.html` in any modern web browser.

Alternatively, access it via the **Lumina Command Palette** on the portfolio site by pressing `CTRL + /`.

---

## 📁 Project Structure

```text
lexica/
├── index.html        # Dashboard (Main entry point)
├── shared.css        # Global design system and components
├── shared.js         # Core data store and utility functions
├── style.css         # Dashboard-specific styling
├── script.js         # Dashboard-specific logic
├── dictionary/       # Dictionary browsing & search engine
│   ├── index.html
│   ├── style.css
│   └── script.js
├── profile/          # Stats, Activity Log, and Data Management
│   ├── index.html
│   ├── style.css
│   └── script.js
└── README.md         # You are here
```

---

## 👤 Author

**Shyam Sunder Kanth**  
*Android and Web Developer*

---

## 📄 License

This project is open-source and available under the MIT License.
