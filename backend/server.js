require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./db/db');

const app = express();

const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const locationRoutes = require('./routes/locationRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const partRoutes = require('./routes/partRoutes');
const devicePartRoutes = require('./routes/devicePartRoutes');
const repairRoutes = require('./routes/repairRoutes');
const { auth } = require('./middleware/auth');

app.use(express.json());
app.use(cors());

//test server
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/device_parts', devicePartRoutes)
app.use('/api/repair', repairRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});