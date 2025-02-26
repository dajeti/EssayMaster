import { MongoClient } from 'mongodb';

// Replace <username>, <password>, and <dbname> with your actual details
const uri = 'mongodb+srv://Developer_test:e55aymaster@cluster0.mongodb.net/essaymasterdb?retryWrites=true&w=majority';

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