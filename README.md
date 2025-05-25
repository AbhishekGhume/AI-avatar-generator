# Voice Chatbot with Avatar

A full-stack web application that enables users to interact with an AI chatbot through voice, which generates an avatar video response with lip-synchronized speech.

## Working Video of Project
- https://drive.google.com/file/d/1pSlN8DsX34teqOafZDqAVPj_5Fiq_lGp/view?usp=drive_link

## Features

- Google OAuth authentication
- Voice-to-text conversion for user input
- AI-powered responses using Groq API
- Video avatar generation with synchronized lip movements using Wav2Lip
- Email delivery of generated videos
- Dark/light mode toggle

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- Speech recognition Web API

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Google OAuth for user sign-in
- Nodemailer for email delivery
- Python integration for audio/video processing

### AI/ML Components
- Groq API for generating chatbot responses
- Google Text-to-Speech (gTTS) for audio generation
- Wav2Lip for lip synchronization in videos

## Prerequisites

1. Node.js (v14 or higher)
2. Python 3.8+ with pip
3. MongoDB
4. Google OAuth credentials
5. Groq API key
6. Gmail account (for sending emails)
7. Wav2Lip model and checkpoints

## Installation


### Setup Server
```bash
npm install
pip install -r ../requirements.txt
```

## Running the Application

### Start the Server
```bash
node server.js
```

### Start the Client
```bash
npm start
```

The application will be available at http://localhost:3000

## Configuration

### Google OAuth
1. Create a project in Google Cloud Console
2. Enable the Google Sign-In API
3. Create OAuth 2.0 credentials
4. Add authorized JavaScript origins (http://localhost:3000)
5. Add authorized redirect URIs if necessary

### Email Settings
For Gmail:
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in your .env file

## Wav2Lip Setup

1. Clone the Wav2Lip repository:
```bash
git clone https://github.com/Rudrabha/Wav2Lip.git
```

2. Download the pre-trained model file (wav2lip_gan.pth) and place it in the checkpoints directory

3. Update the WAV2LIP_PATH and PRETRAINED_MODEL_PATH in your .env file

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Wav2Lip](https://github.com/Rudrabha/Wav2Lip) for the lip synchronization technology
- [Google Text-to-Speech](https://cloud.google.com/text-to-speech) for audio generation
- [Groq API](https://groq.com/) for AI response generation