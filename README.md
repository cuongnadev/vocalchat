# 🗣️ VOCAlCHAT – REALTIME AI CHAT WITH SPEECH-TO-TEXT & TEXT-TO-SPEECH

## 🧩 Project Environment

- Runtime: **Node.js v22.20.0**  
  https://www.npmjs.com/package/node/v/22.20.0  
- Package manager: **npm v10.x+** or **pnpm**
- Frontend: **React** + **Electron**
- Backend: **Node.js** (TCP Server + Socket.IO)
- AI Services:  
  - OpenAI Whisper (Speech-to-Text)
  - OpenAI TTS (Text-to-Speech)
- Optional: **Python** (for local AI recommendation module)


## 👨‍💻 About the Author

Developed by **Nguyễn Anh Cường (Cường Dev / CeeJay)**  
Facebook: [Nguyễn Anh Cường](https://www.facebook.com/nguyenanh.cuong.600722/)  
Email: [cuongna.dev@gmail.com](mailto:cuongna.dev@gmail.com) 

Collaborator: **Trần Ka Bun (Ka Bun)**  
Facebook: [Trần Bun ](https://www.facebook.com/bunwg29)  
Email: [bun2932005@gmail.com](mailto:bun2932005@gmail.com)

## 🎯 Introduction

**VocalChat** is a realtime communication platform combining voice, text, and AI.
It allows users to chat naturally using speech, while AI models convert **speech to text** and **text to speech** seamlessly.  

### ✨ Core Features

- 🔊 Speech-to-Text (STT): Convert real-time voice input to text messages

- 🗣️ Text-to-Speech (TTS): AI voice replies for natural interaction

- 💬 Realtime Chat: Low-latency communication using Socket.IO (TCP protocol)

- 🧠 AI Integration: Smart language model for auto-responses and summaries

- 🪶 Modern UI: Built with React + Electron for smooth cross-platform performance

This project is developed for the AI for Life Competition, showcasing how Artificial Intelligence enhances daily communication.

## ⚙️ Installation Guide – Development Mode

> **First, setup project**

```bash
# Clone the repository
git clone git@github.com:cuongnadev/vocalchat.git

# Navigate into the project folder
cd vocalchat
```

> **Run the server**
```bash
# Navigate into the project folder server
cd server

# Install dependencies
npm i

# Copy and configure your environment file
cp .env.example .env

# Run the server
npm run dev
```

> **Run the client**
```bash
# Navigate into the project folder client
cd client

# Install dependencies
npm i

# Copy and configure your environment file
cp .env.example .env

# Run the client web
npm run dev

# Run the client electron
npm run dev:electron
```

## 🌐 Deployed Project

**Render** is a cloud platform that supports deploying both the **frontend** and **backend** of your application.  
You can try the deployed version of VocalChat here:
👉 https://vocalchat.onrender.com (updating)

## 🧠 Learn More

To learn more about the technologies used in **VocalChat**, check out these resources:

### ⚡ React + Electron
- [Electron Docs](https://www.electronjs.org/docs/latest) – Build cross-platform desktop apps    
- [Learn React](https://react.dev/learn) – Declarative UI framework

### 🧩 Node.js + Socket.IO
- [Node.js Docs](https://nodejs.org/en/docs) – Learn more about runtime environment and npm modules.  
- [Socket.IO Docs](https://socket.io/docs/v4) – Realtime communication framework.

### 🧠 AI Speech Services
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)  
- [OpenAI Text-to-Speech](https://platform.openai.com/docs/guides/text-to-speech)

### 🐍 Python Integration
- [PyTorch](https://pytorch.org/) – Local model inference.  
- [Transformers](https://huggingface.co/docs/transformers/index) – Run pre-trained speech models.

### ☁️ Render
- [Render Docs](https://render.com/docs) – Cloud platform to deploy both frontend and backend services.  
- [Render GitHub Integration](https://render.com/docs/github) – Learn how to deploy automatically from GitHub.

---
