# Tem English - Project Context

## Project Overview
A minimalist English learning site with a cream-colored, tactile UI. 
- **Frontend**: HTML/CSS/JS (GitHub Pages)
- **Authentication**: Telegram Login Widget
- **Backend/Database**: Google Apps Script (Internal Store)
- **Management**: Telegram Bot Commands

## Essential Credentials & URLs
- **Bot Username**: `@Tem_english_bot`
- **Bot Token**: `8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk`
- **Admin Chat ID**: `6172408005`
- **Google Script Web App URL**: `https://script.google.com/macros/s/AKfycbzdBCB9nijiZ9SdC_69Ou-ZaTRpYCpfEr_PcWXEI2VN4jc4xH8ZUnBCmbaD2Pe6_nSE0g/exec`
- **GitHub Repository**: `https://github.com/Adrian-Myat-005/tem_english`

## System Architecture
1. **Login Flow**: Student clicks Telegram Login on the site -> `script.js` sends data to Google Script via `doGet`.
2. **Data Storage**: Google Script uses `PropertiesService` to store a JSON list of students.
3. **Admin Notifications**: Every new registration triggers a `sendMessage` from the Bot to the Admin.
4. **Admin Commands**:
    - `/start`: Menu
    - `/students`: List all registered students
    - `/remove [id]`: Remove a student by their ID
    - `/broadcast [msg]`: Message all students
    - `/clear`: Reset the list

## Design Standards
- **Aesthetic**: Cream background (#fdfaf0), minimalist, monochrome system symbols only.
- **Buttons**: Tactile white buttons with solid 3D shadows. No ripple animations.
- **Stability**: Disabled double-tap zoom and tap highlights.

## Maintenance Notes
- Every time `google_script.js` is updated, it **MUST** be deployed as a "New Version" in Google Apps Script.
- The Telegram Webhook must point to the latest Google Script URL.
