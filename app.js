const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require("cors");
const mongoose = require('mongoose');


const userRoutes = require('./routes/userRoutes');
const incomeExpenseRoutes = require('./routes/incomeExpenseRoutes');


mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => { console.log('connected') });
app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);
app.use('/incomeExpenses', incomeExpenseRoutes);

app.listen(process.env.port, () => {
    console.log('Server active');
});