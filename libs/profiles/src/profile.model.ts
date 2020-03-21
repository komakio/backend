import { ObjectID } from 'mongodb';
import { IsIn, IsNumber, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class Location {
    @IsIn(['point'])
    public type: 'point';
    @IsNumber({}, { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    public coordinates?: number[];
}

export class Profile {
    public _id: ObjectID;
    public userId: ObjectID;
    public createdAt: Date;
    public lastActivityAt: Date;
    public lastAffirmativeAt: Date;
    public self?: boolean;
    public name: string;
    public location?: Location;
    public disabled?: boolean;
    public role: 'helper' | 'needer';
    public phone: string;
    public country: string;
}
