import express from 'express';



const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ msg: 'success from API' });
});

app.listen(3000, () => {
  console.log('success from backend ');
});