import {BaseModel} from "./base.model";
import {ObjectId} from "mongodb";

export class UserModel extends BaseModel {
    private readonly email: string;
    private readonly username: string;
    static readonly collectionName = 'users';

    constructor(username: string, email: string) {
        super();
        this.email = email;
        this.username = username;
    }

    save() {
        return UserModel.collection(UserModel.collectionName)
            .insertOne({
                email: this.email,
                username: this.username,
            });
    }

    static findByPk(id: string) {
        return UserModel.collection(this.collectionName)
            .find({
                _id: new ObjectId(id),
            })
            .next()
            .then((data: any) => ({
                ...data,
                id: data._id.toString(),
            }))
    }
}