require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const dashboardRoutes = require('./routes/dashboard');
const billingRoutes = require('./routes/billing');
const salesRoutes = require('./routes/sales');
const revenueRoutes = require('./routes/revenue');
const employeeRoutes = require('./routes/employees');
const salaryRoutes = require('./routes/salary');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public/frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/salary', salaryRoutes);

// Fallback to index.html for unknown routes (useful if you have client-side routing)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
