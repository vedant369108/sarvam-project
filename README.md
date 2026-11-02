# Sarvam Indic Studio 🇮🇳

> High-precision Neural Translation, Phonetic Transliteration, and Speech-to-Text across 22+ Indian Languages powered by **Sarvam AI** (`sarvam-translate:v1`, `mayura:v1`, and `saaras:v3`).

---

## 🌟 Key Features

1. **Neural Translation (`sarvam-translate:v1` & `mayura:v1`)**:
   - Supports 22 Scheduled Indian Languages + English + Auto-detect.
   - Dual engine: `sarvam-translate:v1` (structured, formal) & `mayura:v1` (modern colloquial, code-mixed like Hinglish).
   - Speaker gender inflection (`Male`, `Female`, `Neutral`) for gendered languages.
   - Numeral systems (International `1, 2, 3` vs Native Indic `१, २, ३`).
   - Output script options (Native script vs Romanized transliteration).

2. **Speech to Text (Saaras STT)**:
   - Live microphone voice input directly in the editor.
   - Drag-and-drop audio file upload (`.mp3`, `.wav`, `.m4a`, `.ogg`, `.webm`).
   - Automatically detects spoken Indian language and outputs accurate text.

3. **Phonetic Transliteration (Lipi Antaran)**:
   - Type in English/Latin letters (e.g., `namaste dosto`) to convert into authentic native scripts.

4. **Language & Script Detector**:
   - Analyzes text to detect language codes and ISO script families.

5. **Aesthetics & UX**:
   - Dark & Light mode toggle with sleek glassmorphism.
   - Text-to-speech audio playback.
   - Offline translation history saved in `localStorage`.
   - Keyboard shortcuts (`Ctrl + Enter` to translate).

---

## 🚀 Quickstart (Run Locally)

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd <repo-folder>
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Create a `.env` file (or copy from `.env.example`):
```env
SARVAM_API_KEY=your_sarvam_api_key_here
PORT=8000
```

### 4. Start the server
```bash
python server.py
```
Open **`http://localhost:8000`** in your browser.

---

## ☁️ Deployment Guide

### Option 1: Render (Recommended - Free & Instant)
1. Push this repository to your GitHub account.
2. Sign in to [Render](https://render.com).
3. Click **New +** > **Web Service**, and connect your GitHub repository.
4. Set:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
5. In the **Environment Variables** section, add:
   - `SARVAM_API_KEY`: *Your Sarvam API Key*
6. Click **Deploy Web Service**!

### Option 2: Railway
1. Go to [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Add the environment variable `SARVAM_API_KEY`.
4. Railway will automatically detect the `Procfile` / `Dockerfile` and deploy.

### Option 3: Docker Container
```bash
docker build -t sarvam-indic-studio .
docker run -p 8000:8000 -e SARVAM_API_KEY=your_key sarvam-indic-studio
```

---

## 🔒 Security
- Your `SARVAM_API_KEY` is loaded on the server and is never exposed to client-side browsers.
- Always ensure `.env` is listed in `.gitignore` before committing.
