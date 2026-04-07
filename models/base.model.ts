import {Db} from "mongodb";
import {getDb} from "../database";

export class BaseModel {
    private _db: Db;
    collectionName: string = '';

    constructor() {
        this._db = getDb();
    }

    protected getCollection(collection?: string) {
        return this._db.collection(collection || this.collectionName);
    }

    public static collection(collectionName: string) {
        return getDb().collection(collectionName);
    }
}