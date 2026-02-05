import cors from 'cors';
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


export default app;