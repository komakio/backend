import { ObjectID } from 'bson';
import { Exclude, classToClass } from 'class-transformer';

export class User {
    public _id: ObjectID;
    public createdAt: Date;
    public lastLoginAt?: Date;
    public uuid: string;
    public locations: string[];
    @Exclude()
    public password?: string;
    public name: string;

    constructor(partial: Partial<User>) {
        Object.assign(this, partial);
    }

    public toJson?() {
        return Object.assign(this, {
            _id: this._id ? (typeof this._id === 'string' ? this._id : this._id.toHexString()) : null,
        });
    }

    public serialize?(): User {
        return classToClass(new User(this)).toJson();
    }
}
