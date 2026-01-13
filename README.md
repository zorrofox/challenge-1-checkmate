# Checkmate ♟️

An intelligent grocery assistant that turns your passive list-keeping into an active, smart experience.

## Features

-   **AI Auto-Breakdown**: Type what you need, and the AI automatically breaks it down into tasks or items.
-   **Recipe Integration**: Paste a recipe link or description, and the AI extracts ingredients into a categorized list.
-   **Auto-Categorization**: Automatically groups items by aisle (Produce 🥬, Dairy 🥛, Meat 🥩, etc.) for efficient shopping.
-   **Voice-to-List**: Natural language voice input to add multiple items at once using Web Speech API.
-   **Meal Plan to List**: Generate a weekly meal plan and shopping list from a single prompt (e.g., "healthy dinners for two").
-   **LocalStorage Persistence**: Your chat history and items are saved in your browser.
-   **Secure API Key**: Enter your own Gemini API key in the settings for secure access.

## Tech Stack

-   **Framework**: Vite + React
-   **Styling**: Plain CSS (Modern & Responsive)
-   **AI**: Gemini API (via `@google/generative-ai`)
-   **Voice**: Web Speech API
-   **Storage**: LocalStorage

## Getting Started

### Prerequisites

-   Node.js and npm installed.
-   A Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1.  Clone the repository (or download the files).
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open the app in your browser (usually `http://localhost:5173`).
5.  Click the ⚙️ icon in the top right to enter your Gemini API key.

## Security Updates

- **January 2026**: Updated React and React-DOM to version `19.2.3` to patch critical security vulnerabilities (CVE-2025-55182 / React2Shell) related to React Server Components.

## License

MIT
