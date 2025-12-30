import express from 'express';
import path from 'path';
import cors from 'cors';
import { inngest } from './lib/inngest.js';
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';



const app = express();

const __dirname = path.resolve();


// Middleware to parse JSON requests
app.use(express.json());
// credentials:true meaning that the server should accept cookies, authorization headers or TLS client certificates sent by the browser to the API server.
// Enable CORS for all routes
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}));

// Health check endpoint


app.use("/api/inngest", serve({ client: inngest, functions }));


app.get('/health', (req, res) => {
  res.status(200).json({ msg: 'API is up and running' });
});



app.get('/books', (req, res) => {
  res.status(200).json({ msg: 'this is the books endpoint' });
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