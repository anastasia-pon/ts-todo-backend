import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connectDb = await mongoose.connect(process.env.DATABASE_URL || 'noDbUrl', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log(`MongoDB Connected: ${connectDb.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
