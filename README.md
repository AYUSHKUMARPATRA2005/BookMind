<div align="center">

<!-- Hero Banner -->
![BookMind Banner](https://capsule-render.vercel.app/api?type=waving&color=0D9488,1A2B4A&height=200&section=header&text=BookMind&fontSize=80&fontColor=ffffff&fontAlignY=38&desc=AI-Powered%20Book%20Summarizer%20%26%20Study%20Aid%20Generator&descAlignY=58&descSize=18&animation=fadeIn)

<br/>

<p>
  <img src="https://img.shields.io/badge/Status-Active-0D9488?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/Built%20With-Vanilla%20JS-F59E0B?style=for-the-badge&logo=javascript&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-1A2B4A?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Zero-Backend-0D9488?style=for-the-badge" />
</p>

<br/>

> **Read less. Understand more.**
> Drop in any book chapter or research paper — get back a clean summary, flashcards, and practice questions in seconds.

<br/>

[🚀 Live Demo](#-live-demo) &nbsp;•&nbsp; [✨ Features](#-features) &nbsp;•&nbsp; [🛠️ Tech Stack](#️-tech-stack) &nbsp;•&nbsp; [📦 Installation](#-installation) &nbsp;•&nbsp; [🏗️ Architecture](#️-architecture) &nbsp;•&nbsp; [👥 Team](#-team)

<br/>

</div>

---

## 🎯 What is BookMind?

**BookMind** is a fully browser-based, AI-powered study tool that transforms any long text into four types of study material — instantly, privately, and for free.

No sign-up. No server. No cost. Just open, paste, and study.

```
📄 Your Text  ──▶  🤖 Gemini AI  ──▶  📋 Summary
                                    ──▶  🔑 Key Points
                                    ──▶  🃏 Flashcards
                                    ──▶  ❓ Q&A Pairs
```

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📋 Smart Summaries
Choose from **Brief**, **Standard**, or **Detailed** mode. Get the full argument distilled into clear paragraphs — no fluff, no filler.

</td>
<td width="50%">

### 🔑 Key Points
The core takeaways pulled out as a numbered bullet list. Perfect for last-minute revision before an exam.

</td>
</tr>
<tr>
<td width="50%">

### 🃏 Interactive Flashcards
Beautiful 3D flip-card animation. Navigate with **clicks**, **arrow keys**, or **swipes**. A progress bar tracks your position in the deck.

</td>
<td width="50%">

### ❓ Q&A Practice
Questions and answers styled as an accordion — question always visible, answer hidden until you click. Forces active recall.

</td>
</tr>
<tr>
<td width="50%">

### 📂 PDF & File Upload
Drag and drop a **PDF**, **TXT**, or **Markdown** file. Text is extracted right inside your browser using `pdf.js` — no upload to any server.

</td>
<td width="50%">

### 💾 3-Format Export
Download your results as **plain TXT**, **structured JSON**, or a formatted **PDF** — all generated client-side with `jsPDF`.

</td>
</tr>
</table>

---

## 🛡️ Privacy First

> **Your text never leaves your browser** — except for the one call to Google's Gemini API.

BookMind has **zero backend infrastructure**. There is no database, no user storage, no analytics, no tracking. Everything runs locally in your browser. The only network request is the AI call to Google Gemini.

```
❌  No account required
❌  No data stored on any server  
❌  No ads, no tracking, no cookies
✅  100% open — inspect every line of code
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JS (ES6+) | UI, state management, event handling |
| **AI Model** | Google Gemini Flash (`gemini-2.5-flash`) | Text comprehension & structured JSON generation |
| **PDF Input** | Client-side PDF text extraction |
| **PDF Export** | Client-side PDF generation |
| **Fonts** | Source Serif 4, DM Sans (Google Fonts) | Typography |
| **Hosting** | Any static host (GitHub Pages, Netlify, Vercel) | Zero-config deployment |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                             │
│   ┌──────────────┐      ┌──────────────────────────────┐   │
│   │  index.html  │      │           app.js              │   │
│   │              │◀────▶│  • Tab switching              │   │
│   │  • Input     │      │  • File handling              │   │
│   │    panels    │      │  • Prompt building            │   │
│   │  • Result    │      │  • Result rendering           │   │
│   │    tabs      │      │  • Export logic               │   │
│   └──────────────┘      └──────────────┬─────────────────┘  │
│                                        │                    │
│   ┌──────────────┐      ┌─────────────▼─────────────────┐   │
│   │  style.css   │      │         pdf.js (CDN)           │   │
│   │              │      │  • Reads uploaded PDFs         │   │
│   │  • 3D flip   │      │  • Extracts text per page      │   │
│   │  • Accordion │      │  • No server needed            │   │
│   │  • Responsive│      └──────────────────────────────┘   │
│   └──────────────┘                                         │
│                                                             │
└─────────────────────────────┬───────────────────────────────┘
                              │  HTTPS (one request per session)
                              ▼
               ┌──────────────────────────────┐
               │     Google Gemini Flash       │
               │                              │
               │  Input:  Structured prompt   │
               │  Output: Raw JSON object     │
               │                              │
               │  { summary, keypoints,       │
               │    flashcards, qa }          │
               └──────────────────────────────┘
```

---

## 🔄 Data Flow

```
 ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
 │  1.INPUT │───▶│ 2.CONFIG │───▶│ 3. BUILD │───▶│ 4.  API  │
 │          │    │          │    │          │    │  CALL    │
 │ Paste or │    │ Summary  │    │ JSON     │    │ POST to  │
 │ upload   │    │ length,  │    │ schema   │    │ Gemini   │
 │ text/PDF │    │ FC count │    │ prompt   │    │ Flash    │
 └──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                       │
 ┌──────────┐    ┌──────────┐    ┌──────────┐         │
 │ 7.EXPORT │◀───│ 6.RENDER │◀───│5.PARSE   │◀────────┘
 │          │    │          │    │          │
 │ TXT /    │    │ Fill all │    │ Strip    │
 │ JSON /   │    │ 4 panels │    │ fences,  │
 │ PDF      │    │ in UI    │    │ JSON.    │
 │ download │    │          │    │ parse()  │
 └──────────┘    └──────────┘    └──────────┘
```

---

## ⚙️ Configuration Options

Before generating, users can configure three settings:

| Setting | Options | Effect |
|---|---|---|
| **Summary Length** | Brief / Standard / Detailed | Controls how many paragraphs the AI writes |
| **Flashcard Count** | 5 / 10 / 15 | Controls the size of the flashcard deck |
| **Q&A Count** | 5 / 8 / 12 | Controls the number of practice questions |

These values are injected directly into the AI prompt — no post-processing needed.

---

## 📁 Project Structure

```
bookmind/
│
├── index.html          # All HTML — structure, panels, loading overlay
├── style.css           # All CSS — layout, 3D flip animation, responsive design
├── app.js              # All JS  — state, API, rendering, export
│
└── README.md           # You are here
```

That's it. Three files. Fully self-contained.

---

## 🌐 Browser Support

| Browser | Version | Status |
|---|---|---|
| Chrome / Edge | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Mobile Chrome (Android) | 90+ | ✅ Full support |
| Mobile Safari (iOS) | 14+ | ✅ Full support |
| Internet Explorer | Any | ❌ Not supported |

---

## 🚀 Roadmap

- [ ] **OCR support** — extract text from scanned / image-based PDFs using Tesseract.js
- [ ] **Regional languages** — generate study aids in Odia, Hindi, Bengali, Tamil, and more
- [ ] **Spaced repetition** — SM-2 algorithm to schedule flashcard review sessions
- [ ] **Save study sets** — local storage or optional cloud sync for returning users
- [ ] **Anki export (.apkg)** — import generated flashcards directly into Anki
- [ ] **Voice read-aloud** — Web Speech API integration for hands-free study
- [ ] **Progressive Web App** — offline support and installable on mobile home screen
- [ ] **Document chunking** — process documents longer than 12,000 characters in sections

---

## 👥 Team

Built with ❤️ by **Team BookMind** — CSE-D, NIST University, Brahmapur

| Name | Roll Number |
|---|---|
| Ayush Kumar Patra | 202456438 |
| Pallavi Samadarsini Biswal | 202457442 |
| Deepali Sahu | 202457443 |
| Simon Kumar Panda | 202456424 |
| Shreya Badatya | 202457463 |
| Monika Metta | 202457463 |

*Submitted for the **NIST University Smart Campus Appathon 2026***

---

## 📄 License

```
MIT License

Copyright (c) 2026 Team BookMind

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Acknowledgements

- [Google Gemini](https://ai.google.dev/) — for the AI API that powers the core intelligence
- [Mozilla pdf.js](https://mozilla.github.io/pdf.js/) — for client-side PDF text extraction
- [jsPDF](https://parall.ax/products/jspdf) — for client-side PDF generation
- [Google Fonts](https://fonts.google.com/) — Source Serif 4 &amp; DM Sans typefaces
- Educational psychology research on active recall and spaced repetition

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=1A2B4A,0D9488&height=120&section=footer&animation=fadeIn" />

<p>
  <sub>Made with ❤️ for students, by students | NIST Appathon 2026</sub>
</p>

</div>


