//app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { setupSocketIO } from "./socketSetup.js";
import fs from 'fs';
import https from 'https';

const app = express();

// SSL certificate options
const options = {
  key: fs.readFileSync('192.168.136.42-key.pem'),
  cert: fs.readFileSync('192.168.136.42.pem')
};

const httpsServer = https.createServer(options, app);

const allowedOrigins = [
  'https://localhost:5173',
  'https://192.168.136.42:5173',
  'http://192.168.136.42:5173',
  'http://localhost:5173',
  'https://192.168.1.98:5173',
  'http://192.168.1.98:5173',
  // Add any other origins you need
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: "1600kb" }));
app.use(express.urlencoded({ extended: true, limit: "1600kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes
import router from './routes/user.routes.js';
app.use("/api/v1", router);

// Setup Socket.IO
setupSocketIO(httpsServer);

export { app, httpsServer };
