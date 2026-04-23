import mongoose from "mongoose";
import {env} from "./env";

export const mongoConnect = (cb: any) => {
    return mongoose.connect(
        env.mongoUrl,
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

