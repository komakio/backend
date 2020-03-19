import { User } from '../user.model';
import { ObjectID } from 'bson';
import { IsNumber, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AccessToken {
    @ApiModelProperty({ type: User })
    public user: User;

    @ApiModelProperty()
    @IsNumber()
    public iat: number;

    @ApiModelProperty()
    @IsNumber()
    public exp: number;
}

export class AccessTokenResponse {
    @ApiModelProperty()
    @IsString()
    public accessToken: string;

    /** Timestamp of expiration in ms */
    @ApiModelProperty()
    @IsNumber()
    public expiration: number;
}

export class RefreshToken {
    @ApiModelProperty({ type: 'string' })
    public _id: ObjectID;

    @ApiModelProperty()
    @IsNumber()
    public iat: number;

    @ApiModelProperty()
    @IsNumber()
    public exp: number;
}

export class RefreshTokenResponse {
    @ApiModelProperty()
    @IsString()
    public refreshToken: string;
}
