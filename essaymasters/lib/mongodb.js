import { MongoClient } from 'mongodb';
import bcrypt from "bcryptjs"; // to compare hashed passwords


// Replace <username>, <password>, and <dbname> with your actual details
const uri = 'mongodb+srv://dajeti:essaymaster101@cluster1-essaymaster.zblppz5.mongodb.net/Cluster1-EssayMaster?retryWrites=true&w=majority&appName=Cluster1-EssayMaster';

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const database = client.db('essaymasterdb');
    const collection = database.collection('sample_mflix');

    
    const docs = await collection.find({}).toArray();
    console.log('Documents:', docs);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    
    await client.close();
  }
}

connectDB();
