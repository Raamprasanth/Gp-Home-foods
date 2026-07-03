require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const username = 'GP Admin';
        const password = 'gphf@123';

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Admin user already exists!');
        } else {
            // Create the new admin user
            const adminUser = new User({
                username,
                password, // In a production app, remember to hash this!
                role: 'admin'
            });
            await adminUser.save();
            console.log(`Successfully created default user: ${username}`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding database:', error.message);
        mongoose.connection.close();
    }
};

seedAdmin();
