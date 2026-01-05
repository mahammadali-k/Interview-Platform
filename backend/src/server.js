import express from 'express';
import path from 'path';
import cors from 'cors';
import { serve } from 'inngest/express';
import { protectRoute } from './middleware/protectRoute.js';
import {clerkMiddleware} from "@clerk/express";
import { inngest, functions } from './lib/inngest.js';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import chatRoutes from './routes/chatRoutes.js';
import sessionRoutes from './routes/sessionRoute.js';



const app = express();

const __dirname = path.resolve();


// Middleware to parse JSON requests
app.use(express.json());
// credentials:true meaning that the server should accept cookies, authorization headers or TLS client certificates sent by the browser to the API server.
// Enable CORS for all routes
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}));

app.use(clerkMiddleware()); //this adds auth field to req object:req.auth()

// Health check endpoint


app.use("/api/inngest", serve({ client: inngest, functions }));
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoutes);

app.get('/health', (req, res) => {
  
  res.status(200).json({ msg: 'API is up and running' });
});









//Make our app ready for production

if(ENV.NODE_ENV==='production'){
  app.use(express.static(path.join(__dirname,'../frontend/dist')));
  
app.get("/{any}"),(req,res)=>{
  res.sendFile(path.join(__dirname,'../frontend/dist/index.html'));

}
}

  
const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log(`Server is running on port ${ENV.PORT}`);

    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};


startServer();