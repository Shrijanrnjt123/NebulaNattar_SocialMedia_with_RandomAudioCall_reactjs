
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import fs from 'fs';
import https from 'https';
import { setupSocketIO } from "./socketSetup.js";

dotenv.config({
  path: './.env'
});

connectDB()
  .then(() => {
    const privateKey = fs.readFileSync('192.168.136.42-key.pem', 'utf8');
    const certificate = fs.readFileSync('192.168.136.42.pem', 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    // Create HTTPS server
    const httpsServer = https.createServer(credentials, app);

    // Initialize Socket.IO
    setupSocketIO(httpsServer);

    // Start HTTPS server
    const PORT = process.env.PORT || 7000;
    httpsServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed !!", err);
  });
