const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io
    const io = new Server(httpServer, {
        cors: {
            origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL,
            methods: ['GET', 'POST']
        }
    });

    // Store io instance globally for API routes to access
    global.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Join a competition room
        socket.on('join-competition', (competitionId) => {
            socket.join(`competition-${competitionId}`);
            console.log(`Socket ${socket.id} joined competition-${competitionId}`);
        });

        // Leave a competition room
        socket.on('leave-competition', (competitionId) => {
            socket.leave(`competition-${competitionId}`);
            console.log(`Socket ${socket.id} left competition-${competitionId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});
