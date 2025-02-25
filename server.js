// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const { spawn } = require('child_process');
// const fs = require('fs'); // Add this line for synchronous fs operations
// const fsPromises = require('fs').promises;
// const path = require('path');
// const fetch = require('node-fetch');
// const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require('google-auth-library');
// const connectDB = require('./config/db');
// const User = require('./models/User');
// const auth = require('./middleware/auth');
// const { sendVideoEmail } = require('./utils/emailUtils');

// const app = express();
// const port = 5000;

// // Connect to MongoDB
// connectDB();

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(cookieParser());
// app.use(bodyParser.json());

// // Create uploads directory at server startup
// const uploadsDir = path.join(__dirname, 'uploads');
// try {
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//   }
//   // Serve static files
//   app.use('/uploads', express.static(uploadsDir));
// } catch (error) {
//   console.error('Error creating uploads directory:', error);
// }

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Initialize Google OAuth client
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Auth Routes
// app.post('/api/auth/google', async (req, res) => {
//   try {
//     const { token } = req.body;
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const { name, email, picture, sub: googleId } = ticket.getPayload();

//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         picture,
//         googleId
//       });
//     }

//     const jwtToken = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.cookie('token', jwtToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 24 * 60 * 60 * 1000
//     });

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         picture: user.picture
//       }
//     });
//   } catch (error) {
//     console.error('Auth error:', error);
//     res.status(500).json({ message: 'Authentication failed' });
//   }
// });

// app.post('/api/auth/logout', (req, res) => {
//   res.clearCookie('token');
//   res.json({ message: 'Logged out successfully' });
// });

// app.get('/api/auth/user', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-googleId');
//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user' });
//   }
// });


// const WAV2LIP_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip';
// const PRETRAINED_MODEL_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip/checkpoints/wav2lip_gan.pth';

// // File cleanup utility function
// const cleanupFiles = async (files) => {
//   for (const file of files) {
//     try {
//       const exists = await fs.access(file).then(() => true).catch(() => false);
//       if (exists) {
//         await fs.unlink(file);
//         console.log(`Successfully deleted: ${file}`);
//       }
//     } catch (error) {
//       console.error(`Error deleting file ${file}:`, error);
//     }
//   }
// };

// // Function to generate audio using gTTS
// async function generateAudioFile({ text, outputFile }) {
//   return new Promise((resolve, reject) => {
//     console.log('Generating audio with text:', text);
//     const process = spawn('python', [
//       path.join(__dirname, 'generate_audio.py'),
//       `"${text}"`,
//       outputFile,
//     ]);

//     process.stdout.on('data', (data) => console.log(`stdout: ${data}`));
//     process.stderr.on('data', (data) => console.error(`stderr: ${data}`));

//     process.on('close', (code) => {
//       if (code === 0) {
//         console.log('Audio generated successfully:', outputFile);
//         resolve();
//       } else {
//         reject(new Error(`gTTS process exited with code ${code}`));
//       }
//     });

//     process.on('error', (err) => {
//       reject(err);
//     });
//   });
// }


// // Protect your existing routes with auth middleware
//     // Chat route
// app.post('/chat', async (req, res) => {
//   const { prompt } = req.body;
//   const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
//   const adjustedPrompt = `
//   Generate the SHORTEST possible spoken response using 5-20 words (MAX 25 words). Follow STRICTLY:
//   1. Absolute minimum words needed to answer
//   2. NO special characters of any kind
//   3. NO introductory phrases
//   4. Use ONLY periods for sentence endings
//   5. Prioritize brevity over completeness
//   6. Use simple words and contractions

//   Format: Single continuous sentence with NO line breaks
//   Query: "${prompt}"
// `;

//   try {
//     const response = await fetch(groqUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer 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',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'llama3-8b-8192',
//         messages: [{ role: 'user', content: adjustedPrompt }],
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       const botReply = data.choices[0]?.message?.content || "I'm sorry, I couldn't understand.";
//       res.json({ response: botReply });
//     } else {
//       console.error('Error from Groq API:', data);
//       res.status(500).send('Error processing the request');
//     }
//   } catch (error) {
//     console.error('Error communicating with the Groq API:', error);
//     res.status(500).send('Error processing the request');
//   }
// });  

//   // Your existing generate-avatar route code
//   // Avatar generation route
//   app.post('/generate-avatar', auth, async (req, res) => {
//     const { text } = req.body;
//     let audioFilePath, outputVideoPath;
  
//     try {
//       const timestamp = Date.now();
//       audioFilePath = path.join(uploadsDir, `speech_${timestamp}.wav`);
//       const inputVideoPath = path.join(__dirname, 'input_video_women.mp4');
//       outputVideoPath = path.join(uploadsDir, `output_${timestamp}.mp4`);
  
//       // Ensure the uploads directory exists before proceeding
//       await fsPromises.mkdir(uploadsDir, { recursive: true }).catch(err => {
//         if (err.code !== 'EEXIST') throw err;
//       });
  
//       // Generate audio
//       await generateAudioFile({
//         text: text,
//         outputFile: audioFilePath,
//       });
  
//       console.log('Audio file generated:', audioFilePath);
  
//       // Run Wav2Lip lip-sync process
//       await new Promise((resolve, reject) => {
//         console.log('Starting Wav2Lip process...');
//         const wav2lipProcess = spawn('python', [
//           path.join(WAV2LIP_PATH, 'inference.py'),
//           '--checkpoint_path', PRETRAINED_MODEL_PATH,
//           '--face', inputVideoPath,
//           '--audio', audioFilePath,
//           '--outfile', outputVideoPath,
//         ], {
//           stdio: 'inherit',
//           shell: true,
//         });
  
//         wav2lipProcess.on('close', (code) => {
//           if (code === 0) {
//             console.log('Wav2Lip process completed successfully');
//             resolve();
//           } else {
//             reject(new Error(`Wav2Lip process exited with code ${code}`));
//           }
//         });
  
//         wav2lipProcess.on('error', (error) => {
//           console.error('Wav2Lip process error:', error);
//           reject(error);
//         });
//       });
  
//       // Check if output video exists
//       let fileExists = false;
//       for (let i = 0; i < 30; i++) {
//         fileExists = await fsPromises.access(outputVideoPath)
//           .then(() => true)
//           .catch(() => false);
//         if (fileExists) break;
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
  
//       if (!fileExists) {
//         throw new Error('Video generation failed - output file not found');
//       }
  
//       // Send email
//       try {
//         await sendVideoEmail(
//           req.user.email,
//           outputVideoPath,
//           'Your avatar video has been generated successfully!'
//         );
//         console.log('Video email sent successfully');
//       } catch (emailError) {
//         console.error('Failed to send email:', emailError);
//       }
  
//       // Return response
//       const videoFileName = path.basename(outputVideoPath);
//       const videoUrl = `/uploads/${videoFileName}`;
  
//       res.json({
//         success: true,
//         videoUrl,
//         emailSent: true,
//         timestamp: Date.now()
//       });
  
//       // Schedule cleanup
//       const cleanupDelay = 5 * 60 * 1000; // 5 minutes
//       setTimeout(() => {
//         Promise.all([
//           fsPromises.unlink(audioFilePath).catch(err => console.error('Error deleting audio:', err)),
//           fsPromises.unlink(outputVideoPath).catch(err => console.error('Error deleting video:', err))
//         ]).catch(err => console.error('Cleanup failed:', err));
//       }, cleanupDelay);
  
//     } catch (error) {
//       console.error('Error generating avatar video:', error);
      
//       // Cleanup files in case of error
//       if (audioFilePath || outputVideoPath) {
//         Promise.all([
//           audioFilePath ? fsPromises.unlink(audioFilePath).catch(() => {}) : Promise.resolve(),
//           outputVideoPath ? fsPromises.unlink(outputVideoPath).catch(() => {}) : Promise.resolve()
//         ]).catch(err => console.error('Error cleanup failed:', err));
//       }
  
//       res.status(500).json({
//         error: error.message,
//         success: false,
//         emailSent: false
//       });
//     }
//   });



//  app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
//   });
























































// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// const { spawn } = require('child_process');
// const fs = require('fs'); // Add this line for synchronous fs operations
// const fsPromises = require('fs').promises;
// const path = require('path');
// const fetch = require('node-fetch');
// const jwt = require('jsonwebtoken');
// const { OAuth2Client } = require('google-auth-library');
// const connectDB = require('./config/db');
// const User = require('./models/User');
// const auth = require('./middleware/auth');
// const { sendVideoEmail } = require('./utils/emailUtils');

// const app = express();
// const port = 5000;

// // Connect to MongoDB
// connectDB();

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(cookieParser());
// app.use(bodyParser.json());

// // Create uploads directory at server startup
// const uploadsDir = path.join(__dirname, 'uploads');
// try {
//   if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//   }
//   // Serve static files
//   app.use('/uploads', express.static(uploadsDir));
// } catch (error) {
//   console.error('Error creating uploads directory:', error);
// }

// // Serve static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Initialize Google OAuth client
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Auth Routes
// app.post('/api/auth/google', async (req, res) => {
//   try {
//     const { token } = req.body;
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID
//     });

//     const { name, email, picture, sub: googleId } = ticket.getPayload();

//     let user = await User.findOne({ email });
//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         picture,
//         googleId
//       });
//     }

//     const jwtToken = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '24h' }
//     );

//     res.cookie('token', jwtToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       maxAge: 24 * 60 * 60 * 1000
//     });

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         picture: user.picture
//       }
//     });
//   } catch (error) {
//     console.error('Auth error:', error);
//     res.status(500).json({ message: 'Authentication failed' });
//   }
// });

// app.post('/api/auth/logout', (req, res) => {
//   res.clearCookie('token');
//   res.json({ message: 'Logged out successfully' });
// });

// app.get('/api/auth/user', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-googleId');
//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user' });
//   }
// });


// const WAV2LIP_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip';
// const PRETRAINED_MODEL_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip/checkpoints/wav2lip_gan.pth';

// // File cleanup utility function
// const cleanupFiles = async (files) => {
//   for (const file of files) {
//     try {
//       const exists = await fs.access(file).then(() => true).catch(() => false);
//       if (exists) {
//         await fs.unlink(file);
//         console.log(`Successfully deleted: ${file}`);
//       }
//     } catch (error) {
//       console.error(`Error deleting file ${file}:`, error);
//     }
//   }
// };

// // Function to generate audio using gTTS
// async function generateAudioFile({ text, outputFile }) {
//   return new Promise((resolve, reject) => {
//     console.log('Generating audio with text:', text);
//     const process = spawn('python', [
//       path.join(__dirname, 'generate_audio.py'),
//       `"${text}"`,
//       outputFile,
//     ]);

//     process.stdout.on('data', (data) => console.log(`stdout: ${data}`));
//     process.stderr.on('data', (data) => console.error(`stderr: ${data}`));

//     process.on('close', (code) => {
//       if (code === 0) {
//         console.log('Audio generated successfully:', outputFile);
//         resolve();
//       } else {
//         reject(new Error(`gTTS process exited with code ${code}`));
//       }
//     });

//     process.on('error', (err) => {
//       reject(err);
//     });
//   });
// }


// // Protect your existing routes with auth middleware
//     // Chat route
// app.post('/chat', async (req, res) => {
//   const { prompt } = req.body;
//   const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
//   const adjustedPrompt = `
//   Generate the SHORTEST possible spoken response using 5-20 words (MAX 25 words). Follow STRICTLY:
//   1. Absolute minimum words needed to answer
//   2. NO special characters of any kind
//   3. NO introductory phrases
//   4. Use ONLY periods for sentence endings
//   5. Prioritize brevity over completeness
//   6. Use simple words and contractions

//   Format: Single continuous sentence with NO line breaks
//   Query: "${prompt}"
// `;

//   try {
//     const response = await fetch(groqUrl, {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer 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',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'llama3-8b-8192',
//         messages: [{ role: 'user', content: adjustedPrompt }],
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       const botReply = data.choices[0]?.message?.content || "I'm sorry, I couldn't understand.";
//       res.json({ response: botReply });
//     } else {
//       console.error('Error from Groq API:', data);
//       res.status(500).send('Error processing the request');
//     }
//   } catch (error) {
//     console.error('Error communicating with the Groq API:', error);
//     res.status(500).send('Error processing the request');
//   }
// });  

//   // Your existing generate-avatar route code
//   // Avatar generation route
//   app.post('/generate-avatar', auth, async (req, res) => {
//     const { text } = req.body;
//     let audioFilePath, outputVideoPath;
  
//     try {
//       const timestamp = Date.now();
//       audioFilePath = path.join(uploadsDir, `speech_${timestamp}.wav`);
//       const inputVideoPath = path.join(__dirname, 'input_video_women.mp4');
//       outputVideoPath = path.join(uploadsDir, `output_${timestamp}.mp4`);
  
//       // Ensure the uploads directory exists before proceeding
//       await fsPromises.mkdir(uploadsDir, { recursive: true }).catch(err => {
//         if (err.code !== 'EEXIST') throw err;
//       });
  
//       // Generate audio
//       await generateAudioFile({
//         text: text,
//         outputFile: audioFilePath,
//       });
  
//       console.log('Audio file generated:', audioFilePath);
  
//       // Run Wav2Lip lip-sync process
//       await new Promise((resolve, reject) => {
//         console.log('Starting Wav2Lip process...');
//         const wav2lipProcess = spawn('python', [
//           path.join(WAV2LIP_PATH, 'inference.py'),
//           '--checkpoint_path', PRETRAINED_MODEL_PATH,
//           '--face', inputVideoPath,
//           '--audio', audioFilePath,
//           '--outfile', outputVideoPath,
//         ], {
//           stdio: 'inherit',
//           shell: true,
//         });
  
//         wav2lipProcess.on('close', (code) => {
//           if (code === 0) {
//             console.log('Wav2Lip process completed successfully');
//             resolve();
//           } else {
//             reject(new Error(`Wav2Lip process exited with code ${code}`));
//           }
//         });
  
//         wav2lipProcess.on('error', (error) => {
//           console.error('Wav2Lip process error:', error);
//           reject(error);
//         });
//       });
  
//       // Check if output video exists
//       let fileExists = false;
//       for (let i = 0; i < 30; i++) {
//         fileExists = await fsPromises.access(outputVideoPath)
//           .then(() => true)
//           .catch(() => false);
//         if (fileExists) break;
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
  
//       if (!fileExists) {
//         throw new Error('Video generation failed - output file not found');
//       }
  
//       // Send email
//       try {
//         await sendVideoEmail(
//           req.user.email,
//           outputVideoPath,
//           'Your avatar video has been generated successfully!'
//         );
//         console.log('Video email sent successfully');
//       } catch (emailError) {
//         console.error('Failed to send email:', emailError);
//       }
  
//       // Return response
//       const videoFileName = path.basename(outputVideoPath);
//       const videoUrl = `/uploads/${videoFileName}`;
  
//       res.json({
//         success: true,
//         videoUrl,
//         emailSent: true,
//         timestamp: Date.now()
//       });
  
//       // Schedule cleanup
//       const cleanupDelay = 5 * 60 * 1000; // 5 minutes
//       setTimeout(() => {
//         Promise.all([
//           fsPromises.unlink(audioFilePath).catch(err => console.error('Error deleting audio:', err)),
//           fsPromises.unlink(outputVideoPath).catch(err => console.error('Error deleting video:', err))
//         ]).catch(err => console.error('Cleanup failed:', err));
//       }, cleanupDelay);
  
//     } catch (error) {
//       console.error('Error generating avatar video:', error);
      
//       // Cleanup files in case of error
//       if (audioFilePath || outputVideoPath) {
//         Promise.all([
//           audioFilePath ? fsPromises.unlink(audioFilePath).catch(() => {}) : Promise.resolve(),
//           outputVideoPath ? fsPromises.unlink(outputVideoPath).catch(() => {}) : Promise.resolve()
//         ]).catch(err => console.error('Error cleanup failed:', err));
//       }
  
//       res.status(500).json({
//         error: error.message,
//         success: false,
//         emailSent: false
//       });
//     }
//   });

//   // Add this route to server.js
// app.post('/generate-from-text', auth, async (req, res) => {
//   const { text } = req.body;
//   let audioFilePath, outputVideoPath;

//   try {
//     const timestamp = Date.now();
//     audioFilePath = path.join(uploadsDir, `text_script_${timestamp}.wav`);
//     const inputVideoPath = path.join(__dirname, 'input_video_women.mp4');
//     outputVideoPath = path.join(uploadsDir, `output_${timestamp}.mp4`);

//     // Ensure the uploads directory exists
//     await fsPromises.mkdir(uploadsDir, { recursive: true }).catch(err => {
//       if (err.code !== 'EEXIST') throw err;
//     });

//     // Generate audio from text
//     await generateAudioFile({
//       text: text,
//       outputFile: audioFilePath,
//     });

//     console.log('Audio file generated from text:', audioFilePath);

//     // Run Wav2Lip lip-sync process
//     await new Promise((resolve, reject) => {
//       console.log('Starting Wav2Lip process for text script...');
//       const wav2lipProcess = spawn('python', [
//         path.join(WAV2LIP_PATH, 'inference.py'),
//         '--checkpoint_path', PRETRAINED_MODEL_PATH,
//         '--face', inputVideoPath,
//         '--audio', audioFilePath,
//         '--outfile', outputVideoPath,
//       ], {
//         stdio: 'inherit',
//         shell: true,
//       });

//       wav2lipProcess.on('close', (code) => {
//         if (code === 0) {
//           console.log('Wav2Lip process completed successfully');
//           resolve();
//         } else {
//           reject(new Error(`Wav2Lip process exited with code ${code}`));
//         }
//       });

//       wav2lipProcess.on('error', (error) => {
//         console.error('Wav2Lip process error:', error);
//         reject(error);
//       });
//     });

//     // Check if output video exists
//     let fileExists = false;
//     for (let i = 0; i < 30; i++) {
//       fileExists = await fsPromises.access(outputVideoPath)
//         .then(() => true)
//         .catch(() => false);
//       if (fileExists) break;
//       await new Promise(resolve => setTimeout(resolve, 1000));
//     }

//     if (!fileExists) {
//       throw new Error('Video generation failed - output file not found');
//     }

//     // Send email
//     try {
//       await sendVideoEmail(
//         req.user.email,
//         outputVideoPath,
//         'Your text script video has been generated successfully!'
//       );
//       console.log('Video email sent successfully');
//     } catch (emailError) {
//       console.error('Failed to send email:', emailError);
//     }

//     // Return response
//     const videoFileName = path.basename(outputVideoPath);
//     const videoUrl = `/uploads/${videoFileName}`;

//     res.json({
//       success: true,
//       videoUrl,
//       emailSent: true,
//       timestamp: Date.now()
//     });

//     // Schedule cleanup
//     const cleanupDelay = 5 * 60 * 1000; // 5 minutes
//     setTimeout(() => {
//       Promise.all([
//         fsPromises.unlink(audioFilePath).catch(err => console.error('Error deleting audio:', err)),
//         fsPromises.unlink(outputVideoPath).catch(err => console.error('Error deleting video:', err))
//       ]).catch(err => console.error('Cleanup failed:', err));
//     }, cleanupDelay);

//   } catch (error) {
//     console.error('Error generating video from text script:', error);

//     // Cleanup files in case of error
//     if (audioFilePath || outputVideoPath) {
//       Promise.all([
//         audioFilePath ? fsPromises.unlink(audioFilePath).catch(() => {}) : Promise.resolve(),
//         outputVideoPath ? fsPromises.unlink(outputVideoPath).catch(() => {}) : Promise.resolve()
//       ]).catch(err => console.error('Error cleanup failed:', err));
//     }

//     res.status(500).json({
//       error: error.message,
//       success: false,
//       emailSent: false
//     });
//   }
// });



//  app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
//   });











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

const app = express();
const port = 5000;


// Constants and Config
const WAV2LIP_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip';
const PRETRAINED_MODEL_PATH = 'D:/voice-input-app-copy-edi/Wav2Lip/checkpoints/wav2lip_gan.pth';
const INPUT_VIDEO_PATH = path.join(__dirname, 'input_video_women.mp4');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Initialize
connectDB();
initializeApp();

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

async function runWav2LipProcess(audioPath, outputPath) {
  return new Promise((resolve, reject) => {
    const wav2lipProcess = spawn('python', [
      path.join(WAV2LIP_PATH, 'inference.py'),
      '--checkpoint_path', PRETRAINED_MODEL_PATH,
      '--face', INPUT_VIDEO_PATH,
      '--audio', audioPath,
      '--outfile', outputPath,
    ], { stdio: 'inherit', shell: true });

    wav2lipProcess.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Wav2Lip exited with code ${code}`));
    });

    wav2lipProcess.on('error', reject);
  });
}

async function handleVideoGeneration(req, res, text, prefix = 'speech') {
  let audioFilePath, outputVideoPath;
  const timestamp = Date.now();

  try {
    // Create file paths
    audioFilePath = path.join(UPLOADS_DIR, `${prefix}_${timestamp}.wav`);
    outputVideoPath = path.join(UPLOADS_DIR, `output_${timestamp}.mp4`);

    // Ensure uploads directory exists
    await fsPromises.mkdir(UPLOADS_DIR, { recursive: true });

    // Generate audio and process video
    await generateAudioFile({ text, outputFile: audioFilePath });
    console.log(`Audio file generated: ${audioFilePath}`);
    
    await runWav2LipProcess(audioFilePath, outputVideoPath);
    console.log('Wav2Lip process completed successfully');

    // Verify output file
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

// Routes
app.post('/generate-avatar', auth, (req, res) => 
  handleVideoGeneration(req, res, req.body.text, 'avatar')
);

app.post('/generate-from-text', auth, (req, res) => 
  handleVideoGeneration(req, res, req.body.text, 'text-script')
);

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Auth Routes
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

    // Chat route
    app.post('/chat', async (req, res) => {
      const { prompt } = req.body;
      const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
      const adjustedPrompt = `
      Generate the SHORTEST possible spoken response using 5-20 words (MAX 25 words). Follow STRICTLY:
      1. Absolute minimum words needed to answer
      2. NO special characters of any kind
      3. NO introductory phrases
      4. Use ONLY periods for sentence endings
      5. Prioritize brevity over completeness
      6. Use simple words and contractions
    
      Format: Single continuous sentence with NO line breaks
      Query: "${prompt}"
    `;
    
      try {
        const response = await fetch(groqUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [{ role: 'user', content: adjustedPrompt }],
          }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          const botReply = data.choices[0]?.message?.content || "I'm sorry, I couldn't understand.";
          res.json({ response: botReply });
        } else {
          console.error('Error from Groq API:', data);
          res.status(500).send('Error processing the request');
        }
      } catch (error) {
        console.error('Error communicating with the Groq API:', error);
        res.status(500).send('Error processing the request');
      }
    });  

// Initialization
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
}

app.listen(port, () => 
  console.log(`Server running on http://localhost:${port}`)
);
