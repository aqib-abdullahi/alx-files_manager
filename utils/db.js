import mongodb from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    this.client = new mongodb.MongoClient(`mongodb://${host}:${port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    this.db = null;
    this.isConnected = false;

    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB connection error:', err);
      } else {
        this.db = this.client.db(database);
        this.isConnected = true;
      }
    });
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    if (!this.isConnected) {
      throw new Error('DBClient is not connected to MongoDB');
    }

    const usersCollection = this.db.collection('users');
    const usersCount = await usersCollection.countDocuments();
    return usersCount;
  }

  async nbFiles() {
    if (!this.isConnected) {
      throw new Error('DBClient is not connected to MongoDB');
    }

    const filesCollection = this.db.collection('files');
    const filesCount = await filesCollection.countDocuments();
    return filesCount;
  }
}

const dbClient = new DBClient();

export default dbClient;
