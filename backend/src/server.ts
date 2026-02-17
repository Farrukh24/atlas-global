import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import pool from './config/database.js';

const port = env.PORT || 3000;
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

const startServer = async () => {
    try {
        // Test database connection
        const client = await pool.connect();
        console.log('✅ Database connection verified');
        client.release();

        server.listen(port, () => {
            console.log(`
      🚀 ATLAS GLOBAL LOGISTICS BACKEND READY
      📡 Mode: ${env.NODE_ENV}
      🔗 URL: http://localhost:${port}
      📦 Version: ${env.API_VERSION}
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool has ended');
            process.exit(0);
        });
    });
});
