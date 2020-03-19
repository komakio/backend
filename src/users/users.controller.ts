import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { IsString } from 'class-validator';
import { UsersService } from './users.service';
import { ObjectID } from 'mongodb';
import { User } from './users.model';

class RegisterDto {
    @IsString()
    public uuid: string;

    @IsString()
    public password: string;
}

export class LoginDto {
    @IsString()
    public uuid: string;

    @IsString()
    public password: string;
}

export class PatchUserDto {
    @IsString()
    public name: string;
    @IsString({ each: true })
    public locations: string[];
}

@Controller('users')
export class UsersController {
    constructor(private users: UsersService) {}

    @Post('register')
    public async register(@Body() body: RegisterDto): Promise<User> {
        const user = await this.users.register(body);
        return user.serialize();
    }

    @Post('login')
    public async login(@Body() body: LoginDto): Promise<User> {
        const user = await this.users.login(body);
        return user.serialize();
    }

    @Put(':id')
    public async patch(@Param('id') id: string, @Body() body: PatchUserDto) {
        const user = await this.users.patch({ id: new ObjectID(id), data: body });
        return { user };
    }
}
