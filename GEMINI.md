# Tem English - Project Context & AI Memory

## Project Overview
A minimalist English learning platform with a cream-colored, tactile UI and deep Telegram integration.
- **Frontend**: HTML/CSS/JS (GitHub Pages)
- **Authentication**: Telegram Login Widget
- **Backend/Database**: Google Apps Script (Internal Store via PropertiesService)
- **Management**: Telegram Bot "Automation Lab"

## Essential Credentials & URLs
- **Bot Username**: `@Tem_english_bot`
- **Bot Token**: `8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk`
- **Admin Chat ID**: `6172408005`
- **Google Script Web App URL**: `https://script.google.com/macros/s/AKfycbwreCxhjscVkc24maOmCWBGQkeNNhNmZpng3ntxs34ssV-WjDRlPp9V3-tSTwTY454lMw/exec`
- **GitHub Repository**: `https://github.com/Adrian-Myat-005/tem_english`

## System Architecture & Features

### 1. Landing Page (Public)
- **Member Strength Slides**: Auto-sliding carousel showing real-time member counts and platform benefits.
- **Aesthetic**: Cream background (#fdfaf0), tactile white cards with solid 3D shadows.

### 2. Member Area (Post-Login)
- **Tabbed Navigation**: Facebook-style tabs:
    - **BLOGS**: Official updates feed. Supports full-color photos and embedded YouTube videos.
    - **FRIENDS**: List of all registered students with profile photos and green "Active" status dots. Includes **"💬 DM"** buttons that link directly to the student's Telegram chat.
    - **TOOLS**: Home for interactive learning modules (Numbers, Days, and Prepositions).

### 3. Learning Tools
- **Numbers Practice**: Flashcard-based practice for numbers up to 100k with text-to-speech.
- **Days Practice**: Mixed listening/multiple-choice exercises for "Tomorrow/Yesterday" logic.
- **Preposition Practice**: Comprehensive "Learn" (Burmese explanations) and "Test" (100 questions) modes.

### 4. Admin "Automation Lab" (Telegram Bot)
- **Persistent Menu**: A "🛠 Dashboard" button always available on the Telegram keyboard.
- **Post Publishing**: 
    - Send a **Photo + Caption** to publish a blog post with an image.
    - Send a **YouTube Link** to publish an embedded video post.
- **Post Management**: One-click deletion of the last 8 posts via inline buttons.
- **Student Management**: List all registered students directly in the bot.
- **Broadcast**: Send global messages via `/broadcast [msg]`.

## Maintenance Protocols (CRITICAL)

### Updating Backend Logic
1. Update `google_script.js`.
2. Deploy as a **"New Deployment"** in Google Apps Script.
3. **MANDATORY**: Update the Telegram Webhook manually after every new deployment.
   - Use URL: `https://api.telegram.org/bot[TOKEN]/setWebhook?url=[NEW_EXEC_URL]`

### Adding New Tools
- Tools should be implemented as **Full-Screen Overlays** in `index.html`.
- Logic should be encapsulated in a named object in `script.js` (e.g., `const toolName = {...}`).
- Buttons for new tools must be added to the `ui.renderTools()` function.

## Design Standards
- **Buttons**: Tactile white buttons, solid shadows, no ripple animations.
- **Spacing**: No elements should be "cut off" or crammed into corners (minimum 10px margin).
- **Colors**: Full-color photos allowed; UI remains cream/black/white.
