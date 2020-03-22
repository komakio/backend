import { ObjectID } from 'mongodb';
import { IsIn, IsNumber, ArrayMinSize, ArrayMaxSize, IsString, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class Geo {
    @IsIn(['Point'])
    public type: 'Point';
    @IsNumber({}, { each: true })
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    public coordinates?: [number, number];
}

export class Location {
    @IsString()
    public address: string;
    @IsString()
    public country: string;
    @ValidateNested()
    @Type(() => Location)
    public geo?: Geo;
}

export class Phone {
    @IsString()
    dialCode: string;
    @IsString()
    number: string;
}

export class Profile {
    public _id: ObjectID;
    public userId: ObjectID;
    public createdAt: Date;
    public lastActivityAt: Date;
    public lastAffirmativeAt: Date;
    public self?: boolean;
    public firstName: string;
    public lastName: string;
    public location?: Location;
    public disabled?: boolean;
    public role: 'helper' | 'needer';
    public phone: Phone;
    public deviceIds: string[];
}
