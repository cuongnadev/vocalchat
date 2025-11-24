# 🗣️ VOCALCHAT – REALTIME AI CHAT WITH SPEECH-TO-TEXT & TEXT-TO-SPEECH

## 🧩 Project Environment

- Runtime: **Node.js v22.20.0**  
  https://www.npmjs.com/package/node/v/22.20.0  
- Package manager: **npm v10.x+** or **pnpm**
- Frontend: **React** + **Electron**
- Backend: **Node.js** (TCP Server + Socket.IO)
- AI Services:  
  - WhisperModel (Speech-to-Text - Local)
- Optional: **Python** (for local AI recommendation module)

## 👨‍💻 About the Author

Developed by **Nguyễn Anh Cường (Cường Dev / CeeJay)**  
Facebook: [Nguyễn Anh Cường](https://www.facebook.com/nguyenanh.cuong.600722/)  
Email: [cuongna.dev@gmail.com](mailto:cuongna.dev@gmail.com) 

Collaborator: **Trần Ka Bun (Ka Bun)**  
Facebook: [Trần Bun](https://www.facebook.com/bunwg29)  
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

### 📋 Prerequisites

Before starting, make sure you have:
- **Node.js v22.20.0** installed
- **npm v10.x+** or **pnpm**
- **Python 3.8+** (if using local WhisperModel)
- **OpenAI API Key** (for cloud-based services)

### 🚀 Step 1: Clone and Setup Project

```bash
# Clone the repository
git clone git@github.com:cuongnadev/vocalchat.git

# Navigate into the project folder
cd vocalchat
```

### 🤖 Step 2: Setup Local WhisperModel (Optional)
```bash
# Navigate to whisper-local directory
cd whisper-local

# Install Python dependencies
pip install -r requirements.txt
```
⚠️ **Important Notes about Local WhisperModel:**

- **Processing Time**: Local models are significantly slower than cloud-based APIs:
  - `tiny` model: ~2-5 seconds per audio clip
  - `base` model: ~5-10 seconds per audio clip
  - `small` model: ~10-20 seconds per audio clip
  - `medium` model: ~20-40 seconds per audio clip
  - `large` model: ~40-60+ seconds per audio clip

- **Hardware Requirements**:
  - Minimum: 4GB RAM for `tiny` and `base` models
  - Recommended: 8GB+ RAM for `small` model
  - GPU recommended for `medium` and `large` models

- **First Run**: The model will be downloaded automatically on first use (can take several minutes depending on size)

- **Performance Tips**:
  - Use `tiny` or `base` model for faster processing during development
  - Use cloud-based OpenAI Whisper API for production (much faster)
  - Consider using GPU acceleration if available (CUDA for NVIDIA GPUs)

### 🖥️ Step 2: Run the Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy and configure your environment file
cp .env.example .env
```

```bash
# Run the server
npm run dev
```

The server will start on `http://localhost:BE_PORT`

### 💻 Step 3: Run the Client

Open a new terminal window:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy and configure your environment file
cp .env.example .env
```

**Run Web Version:**
```bash
npm run dev
```

**Run Electron Desktop Version:**
```bash
npm run dev:electron
```

The web client will be available at `http://localhost:5173`


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
- [Node.js Docs](https://nodejs.org/en/docs) – Learn more about runtime environment and npm modules  
- [Socket.IO Docs](https://socket.io/docs/v4) – Realtime communication framework

### 🧠 AI Speech Services
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)  
- [OpenAI Text-to-Speech](https://platform.openai.com/docs/guides/text-to-speech)
- [OpenAI Whisper (Local)](https://github.com/openai/whisper) – Run Whisper models locally

### 🐍 Python Integration
- [PyTorch](https://pytorch.org/) – Local model inference  
- [Transformers](https://huggingface.co/docs/transformers/index) – Run pre-trained speech models

### ☁️ Render
- [Render Docs](https://render.com/docs) – Cloud platform to deploy both frontend and backend services  
- [Render GitHub Integration](https://render.com/docs/github) – Learn how to deploy automatically from GitHub

## 📝 License

This project is developed for educational purposes and the AI for Life Competition.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

---

Made with ❤️ by Cường Dev & Ka Bun