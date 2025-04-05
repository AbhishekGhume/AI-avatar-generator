require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { spawn } = require('child_process');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const connectDB = require('./config/db');
const User = require('./models/User');
const auth = require('./middleware/auth');
const { sendVideoEmail } = require('./utils/emailUtils');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const ffmpeg = require('fluent-ffmpeg');
const { Deepgram } = require('@deepgram/sdk');
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);


// Constants and Config
const app = express();
const port = 5000;
const WAV2LIP_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip';
const PRETRAINED_MODEL_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip/checkpoints/wav2lip_gan.pth';
const AVATARS_DIR = path.join(__dirname, 'avatars');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Initialize
connectDB();
initializeApp();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function getAvatarVideoPath(avatarId) {
  console.log(`Getting avatar video for ID: ${avatarId}`);
  
  // Map of avatar IDs to their filenames
  const avatarFiles = {
    0: 'input_video_women.mp4',      // Default avatar
    1: 'avatar1.jpg',         // Avatar 1
    2: 'avatar2.jpg',         // Avatar 2
    3: 'avatar3.jpg',         // Avatar 3
    4: 'avatar4.jpg'          // Avatar 4
  };
  
  // Get the filename for the requested avatar ID, or default to input_video.mp4
  const avatarFileName = avatarFiles[avatarId] || avatarFiles[0];
  
  // Full path to the avatar video file
  const avatarPath = path.join(AVATARS_DIR, avatarFileName);
  
  // Log the path to help with debugging
  console.log(`Avatar path: ${avatarPath}`);
  
  // Check if the file exists and log the result
  const fileExists = fs.existsSync(avatarPath);
  console.log(`Avatar file exists: ${fileExists}`);
  
  return avatarPath;
}

// Configure Multer for audio uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      cb(null, `audio_${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3'];
    allowedTypes.includes(file.mimetype) 
      ? cb(null, true)
      : cb(new Error('Only WAV/MP3 files are allowed'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Multer for video uploads
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      cb(null, `video_${Date.now()}${path.extname(file.originalname)}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    allowedTypes.includes(file.mimetype) 
      ? cb(null, true)
      : cb(new Error('Only MP4/MOV/AVI files are allowed'), false);
  },
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Helper Functions
async function generateAudioFile({ text, outputFile }) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [
      path.join(__dirname, 'generate_audio.py'),
      `"${text}"`,
      outputFile,
    ]);

    process.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    process.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    process.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`gTTS process exited with code ${code}`));
    });

    process.on('error', reject);
  });
}

async function runWav2LipProcess(audioPath, outputPath, avatarId = 0) {
  // Get the avatar video path based on the avatarId
  const avatarVideoPath = getAvatarVideoPath(avatarId+1);
  
  // Now use the selected avatar video path
  return runWav2LipProcessWithAvatar(avatarVideoPath, audioPath, outputPath);
}

// Add this helper function that all routes can use
async function runWav2LipProcessWithAvatar(avatarVideoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    const wav2lipProcess = spawn('python', [
      path.join(WAV2LIP_PATH, 'inference.py'),
      '--checkpoint_path', PRETRAINED_MODEL_PATH,
      '--face', avatarVideoPath,  // Use the passed avatar video path
      '--audio', audioPath,
      '--outfile', outputPath,
    ], { stdio: 'inherit', shell: true });

    wav2lipProcess.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Wav2Lip exited with code ${code}`));
    });

    wav2lipProcess.on('error', reject);
  });
}

// Shared Utilities
async function verifyFileExists(filePath, maxAttempts = 30, interval = 1000) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await fsPromises.access(filePath).then(() => true).catch(() => false)) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('Output file not found');
}

function scheduleCleanup(files, delay = 5 * 60 * 1000) {
  setTimeout(() => cleanupFiles(files), delay);
}

async function cleanupFiles(files) {
  await Promise.all(files.map(async (file) => {
    if (file && await fsPromises.access(file).then(() => true).catch(() => false)) {
      await fsPromises.unlink(file).catch(console.error);
    }
  }));
}

async function handleVideoGeneration(req, res, text, prefix = 'speech') {
  let audioFilePath, outputVideoPath;
  const timestamp = Date.now();
  
  // Get the selected avatar ID or use default if not provided
  const avatarId = req.body.avatarId !== undefined ? parseInt(req.body.avatarId) : 0;

  try {
    // Create file paths
    audioFilePath = path.join(UPLOADS_DIR, `${prefix}_${timestamp}.wav`);
    outputVideoPath = path.join(UPLOADS_DIR, `output_${timestamp}.mp4`);
    
    // Ensure uploads directory exists
    await fsPromises.mkdir(UPLOADS_DIR, { recursive: true });

    // Generate audio and process video
    await generateAudioFile({ text, outputFile: audioFilePath });
    console.log(`Audio file generated: ${audioFilePath}`);
    
    // Pass the avatarId to runWav2LipProcess
    await runWav2LipProcess(audioFilePath, outputVideoPath, avatarId);
    console.log('Wav2Lip process completed successfully');

    // Rest of the function remains the same
    await verifyFileExists(outputVideoPath, 30, 1000);

    // Send email notification
    try {
      await sendVideoEmail(
        req.user.email,
        outputVideoPath,
        `Your ${prefix} video has been generated successfully!`
      );
      console.log('Video email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    // Return response
    res.json({
      success: true,
      videoUrl: `/uploads/${path.basename(outputVideoPath)}`,
      emailSent: true,
      timestamp
    });

    // Schedule cleanup
    scheduleCleanup([audioFilePath, outputVideoPath]);

  } catch (error) {
    console.error(`Error generating ${prefix} video:`, error);
    cleanupFiles([audioFilePath, outputVideoPath]);
    res.status(500).json({ error: error.message, success: false, emailSent: false });
  }
}

// Initialization function
function initializeApp() {
  // Middleware setup
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Create uploads directory
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Check for avatars directory and create it if it doesn't exist
  if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true });
    console.log(`Created avatars directory at: ${AVATARS_DIR}`);
  } else {
    console.log(`Avatars directory exists at: ${AVATARS_DIR}`);
    
    // List avatars directory contents for debugging
    try {
      const files = fs.readdirSync(AVATARS_DIR);
      console.log('Available avatar files:', files);
    } catch (err) {
      console.error('Error reading avatars directory:', err);
    }
  }
}

// Routes
// 1. Video Generation Routes
app.post('/generate-avatar', auth, (req, res) => 
  handleVideoGeneration(req, res, req.body.text, 'avatar')
);

app.post('/generate-from-text', auth, (req, res) => 
  handleVideoGeneration(req, res, req.body.text, 'text-script')
);

app.post('/generate-from-audio', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No audio file uploaded'
      });
    }

    const avatarId = req.body.avatarId !== undefined
      ? parseInt(req.body.avatarId, 10)
      : 0;

    const timestamp = Date.now();
    const audioFilePath = req.file.path;
    const outputVideoPath = path.join(UPLOADS_DIR, `output_${timestamp}.mp4`);

    // Process audio with Wav2Lip
    await runWav2LipProcess(audioFilePath, outputVideoPath, avatarId);
    await verifyFileExists(outputVideoPath, 30, 1000);

    // Send email notification
    try {
      await sendVideoEmail(
        req.user.email,
        outputVideoPath,
        'Your audio-to-video conversion is ready!'
      );
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    // Respond with video URL
    res.json({
      success: true,
      videoUrl: `/uploads/${path.basename(outputVideoPath)}`,
      emailSent: true,
      timestamp
    });

    // Schedule cleanup
    scheduleCleanup([audioFilePath, outputVideoPath]);

  } catch (error) {
    console.error('Audio processing error:', error);
    
    // Cleanup files if they exist
    const filesToClean = [];
    if (req.file?.path) filesToClean.push(req.file.path);
    if (req.outputVideoPath) filesToClean.push(req.outputVideoPath);
    
    cleanupFiles(filesToClean);
    
    res.status(500).json({
      success: false,
      error: error.message,
      emailSent: false
    });
  }
});

// 2. Auth Routes
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        googleId
      });
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleId');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// 4. Social Media Content Generation Routes
app.post('/generate-script', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      });
    }

    // Generate script using Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Create a concise social media video script about "${topic}". 
    The script should:
    - Be 15 seconds long when read at a normal pace
    - Have a clear introduction, middle and conclusion
    - Be engaging and conversational
    - Include only text that will be spoken, no camera directions
    - Be between 35-50 words
    - End with a strong call to action
    `;

    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    res.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('Script generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to generate script' 
    });
  }
});

app.post('/regenerate-script', auth, async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false, 
        error: 'Topic is required' 
      });
    }

    // Generate a new script with slightly different prompt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Create a NEW and DIFFERENT concise social media video script about "${topic}". 
    The script should:
    - Be 15 seconds long when read at a normal pace
    - Have a different approach than a standard script
    - Be engaging, attention-grabbing and conversational
    - Include only text that will be spoken, no camera directions
    - Be between 35-50 words
    - End with a compelling call to action
    `;

    const result = await model.generateContent(prompt);
    const script = result.response.text().trim();

    res.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('Script regeneration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to regenerate script' 
    });
  }
});

app.post('/generate-social-video', auth, async (req, res) => {
  // Re-use the existing handleVideoGeneration function
  handleVideoGeneration(req, res, req.body.script, 'social-media');
});

// Video Dubbing Route
app.post('/generate-dubbed-video', auth, videoUpload.single('video'), async (req, res) => {
  let videoFilePath, audioFilePath, translatedAudioPath, outputVideoPath;
  const timestamp = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No video file uploaded'
      });
    }

    const targetLanguage = req.body.targetLanguage || 'en';
    
    // Create file paths
    videoFilePath = req.file.path;
    audioFilePath = path.join(UPLOADS_DIR, `extracted_audio_${timestamp}.wav`);
    translatedAudioPath = path.join(UPLOADS_DIR, `translated_audio_${timestamp}.wav`);
    outputVideoPath = path.join(UPLOADS_DIR, `dubbed_video_${timestamp}.mp4`);

    // Step 1: Extract audio from video
    await extractAudioFromVideo(videoFilePath, audioFilePath);
    console.log(`Audio extracted: ${audioFilePath}`);

    // Step 2: Transcribe audio
    const transcription = await transcribeAudio(audioFilePath);
    console.log('Transcription completed');

    // Step 3: Translate text
    const translatedText = await translateText(transcription, targetLanguage);
    console.log('Translation completed');

    // Step 4: Generate audio from translated text
    await generateAudioFileDub({ text: translatedText, outputFile: translatedAudioPath, lang: targetLanguage });
    console.log(`Translated audio generated: ${translatedAudioPath}`);

    // Step 5: Merge translated audio with original video
    await mergeAudioWithVideo(videoFilePath, translatedAudioPath, outputVideoPath);
    console.log('Audio merged with video');

    // Verify output file
    await verifyFileExists(outputVideoPath, 30, 1000);

    // Send email notification
    try {
      await sendVideoEmail(
        req.user.email,
        outputVideoPath,
        'Your dubbed video is ready!'
      );
      console.log('Video email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    // Return response
    res.json({
      success: true,
      videoUrl: `/uploads/${path.basename(outputVideoPath)}`,
      emailSent: true,
      timestamp
    });

    // Schedule cleanup
    scheduleCleanup([audioFilePath, translatedAudioPath, outputVideoPath]);

  } catch (error) {
    console.error('Error generating dubbed video:', error);
    
    // Cleanup files
    const filesToClean = [videoFilePath, audioFilePath, translatedAudioPath, outputVideoPath].filter(Boolean);
    cleanupFiles(filesToClean);
    
    res.status(500).json({
      success: false,
      error: error.message,
      emailSent: false
    });
  }
});

// Helper functions for audio processing
async function extractAudioFromVideo(videoPath, outputAudioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputAudioPath)
      .audioCodec('pcm_s16le')
      .audioBitrate('128k')
      .audioChannels(1)
      .audioFrequency(16000)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Audio extraction error: ${err.message}`)))
      .run();
  });
}

async function transcribeAudio(audioPath) {
  const audioFile = await fsPromises.readFile(audioPath);
  const source = { buffer: audioFile, mimetype: 'audio/wav' };
  
  const response = await deepgram.transcription.preRecorded(source, {
    punctuate: true,
    model: 'nova-2',
  });
  
  return response.results.channels[0].alternatives[0].transcript;
}

async function translateText(text, targetLanguage) {
  // console.log("Text to translate:", text);
  return new Promise((resolve, reject) => {
    const process = spawn('python', [
      path.join(__dirname, 'translate_text.py'),
      text,
      targetLanguage
    ]);

    let result = '';
    let errorOutput = '';
    
    process.stdout.on('data', (data) => {
      result += data.toString();
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error(`Translation stderr: ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        console.error(`Translation failed with code ${code}: ${errorOutput}`);
        // Fallback to original text if translation fails
        resolve(text);
      }
    });
    
    process.on('error', (err) => {
      console.error(`Error launching translation process: ${err}`);
      // Fallback to original text
      resolve(text);
    });
  });
}

// Enhanced audio generation function with language support
async function generateAudioFileDub({ text, outputFile, lang = 'en' }) {
  return new Promise((resolve, reject) => {
    const process = spawn('python', [
      path.join(__dirname, 'generate_dubbedAudio.py'),
      `"${text}"`,
      outputFile,
      lang
    ]);

    process.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    process.stderr.on('data', (data) => console.error(`stderr: ${data}`));

    process.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`gTTS process exited with code ${code}`));
    });

    process.on('error', reject);
  });
}

async function mergeAudioWithVideo(videoPath, audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .input(audioPath)
      .outputOptions([
        '-map 0:v:0',
        '-map 1:a:0',
        '-c:v copy',
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Video processing error: ${err.message}`)))
      .run();
  });
}

// Start the server
app.listen(port, () => 
  console.log(`Server running on http://localhost:${port}`)
);