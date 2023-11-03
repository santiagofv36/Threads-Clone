import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery',true);

// sourcery skip: use-braces
    if (!process.env.MONGODB_URL) return console.log('MONGODB_URL not found');
    if (isConnected) return console.log('Already connected to database');

    try {
        await mongoose.connect(process.env.MONGODB_URL);
        isConnected = true;
        console.log('Connected to database');
    } catch (err) {
        console.log('Failed to connect to database');
        console.log(err);
    }
}