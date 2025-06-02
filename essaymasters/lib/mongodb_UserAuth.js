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
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    // Connect to the correct database and collection
    const database = client.db("essaymasterdb");
    const collection = database.collection("users"); // Assuming 'users' collection for user data

    return collection;
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err; // rethrow to handle the error in your main logic
  }
}

async function authenticateUser(email, password) {
  const collection = await connectDB();

  try {
    // Find the user by email in the 'users' collection
    const user = await collection.findOne({ email });

    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Invalid password");
    }

    // Return user email if authentication is successful
    return user.email;
  } catch (err) {
    console.error("Authentication error:", err);
    throw err; // rethrow the error for handling
  } finally {
    await client.close(); // Close the DB connection
  }
}

// Example usage:
async function loginUser() {
  try {
    const email = "user@example.com";
    const password = "userpassword"; // This would be from the frontend form input

    const emailAddress = await authenticateUser(email, password);

    console.log("Logged in successfully! User's email:", emailAddress);
  } catch (err) {
    console.log("Login failed:", err.message);
  }
}

loginUser();

connectDB();