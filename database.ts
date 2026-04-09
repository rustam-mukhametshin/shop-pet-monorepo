import mongoose from "mongoose";

export const mongoConnect = (cb: any) => {
    return mongoose.connect(
        process.env.MONGO_URI || 'mongodb+srv://:@cluster0.japfcdr.mongodb.net/shop?appName=Cluster0',
        {}
    )
        .then(result => {
            console.info("Database connected successfully.");
            cb();
        })
        .catch((err) => {
            console.error(err);
            throw err;
        })
}

