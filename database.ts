import {Db, MongoClient} from "mongodb";

let _db: Db;

export const mongoConnect = (cb: any) => {
    MongoClient.connect(
        process.env.MONGO_URI || 'mongodb+srv://:@cluster0.japfcdr.mongodb.net/?appName=Cluster0',
        {})
        .then(result => {
            console.info("Database connected successfully.");
            _db = result.db('shop');
            cb();
        })
        .catch((err) => {
            console.error(err);
            throw err;
        })
}

export const getDb = () => {
    if (_db) {
        return _db;
    }
    throw new Error('MongoDB connection failed!');
}

