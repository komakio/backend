import { Controller, Post, Body } from '@nestjs/common';
import { IsString } from 'class-validator';
import { UsersService } from './users.service';

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

@Controller('users')
export class UsersController {
    constructor(private users: UsersService) {}

    @Post('register')
    public async register(@Body() body: RegisterDto) {
        const user = await this.register(body);
        return user;
    }

    @Post('login')
    public async login(@Body() body: LoginDto) {
        const user = await this.users.login(body);
        return user;
    }
}
