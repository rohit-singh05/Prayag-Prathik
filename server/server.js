const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const routingRoutes = require('./routes/routingRoutes');
const translatingRoutes = require('./routes/translationRoutes');
const packageRoutes = require('./routes/packageRoutes')

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/routes', routingRoutes);
app.use('/api', translatingRoutes);
app.use('/api/packages', packageRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));