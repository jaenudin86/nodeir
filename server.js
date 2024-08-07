require('dotenv').config();
const express = require('express');
const authRouter = require('./routes/auth');

const app = express();
app.use(express.json());

// Gunakan router dengan prefix /api
app.use('/api', authRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});