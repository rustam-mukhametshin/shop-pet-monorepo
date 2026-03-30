import {Db, MongoClient} from "mongodb";


// const sequelize = new Sequelize(
//     process.env.DB_NAME || '',
//     process.env.DB_USER || '',
//     process.env.DB_PASSWORD || '',
//     {
//         dialect: 'mysql',
//         host: process.env.DB_HOST || 'localhost',
//     }
// );
//
// export default sequelize;

let _db: Db;

export const mongoConnect = (cb: (result: unknown) => {}) => {
    MongoClient.connect(
        process.env.MONGO_URI || 'mongodb+srv://:@cluster0.japfcdr.mongodb.net/?appName=Cluster0',
        {})
        .then(result => {
            console.info("Database connected successfully.");
            _db = result.db('shop');
            cb(result);
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

