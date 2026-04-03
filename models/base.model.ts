import {Db} from "mongodb";
import {getDb} from "../util/database";

export class BaseModel {
    private _db: Db;
    collectionName: string = '';

    constructor() {
        this._db = getDb();
    }

    protected getCollection() {
        return this._db.collection(this.collectionName);
    }

    public static collection(collectionName: string) {
        return getDb().collection(collectionName);
    }
}