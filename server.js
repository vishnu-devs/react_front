import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Middleware to parse JSON bodies
app.use(express.json());

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Error logging endpoint
app.post('/log-error', (req, res) => {
  try {
    const { error, context } = req.body;
    const timestamp = new Date().toISOString();
    
    const logEntry = `
[${timestamp}] ${context}
Message: ${error.message}
Stack: ${error.stack || 'No stack trace'}
Response: ${JSON.stringify(error.response || {}, null, 2)}
----------------------------------------
`;

    const logFile = path.join(logsDir, 'error.log');
    fs.appendFileSync(logFile, logEntry);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error writing to log file:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Log server running on port ${PORT}`);
});