import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) so the frontend can communicate with the backend
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// Health Check Endpoint
// Purpose: Confirms that the backend server is up and responsive
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is running'
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.send('AI Learning Management System Backend API is active. Check /api/health for system status.');
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
