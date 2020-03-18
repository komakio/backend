import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsString } from "class-validator";
import { UsersMongoService } from './services/users.mongo.service';
import { ApiProperty } from '@nestjs/swagger';

class RegisterDto {
    @ApiProperty()
    @IsString()
    public uuid: string;

    @ApiProperty()
    @IsString()
    public password: string;
}

class LoginDto {
    @IsString()
    public uuid: string;

    @IsString()
    public password: string;
}

@Controller('users')
export class UsersController {
    constructor(private usersMongo: UsersMongoService) {}

    @Post('register')
    public async register(@Body() body: RegisterDto) {    
      const user = await this.usersMongo.findOneByUuid(body.uuid);
      
      if(user) {
        throw new HttpException(
          'EXISTING_USER',
          HttpStatus.FORBIDDEN
        );
      }
      return this.usersMongo.createOne(body);
    }

    @Post('login')
    public async login(@Body() body: LoginDto) {
      return this.usersMongo.findOneByCredentials({uuid: body.uuid, password: body.password});
    }
}
