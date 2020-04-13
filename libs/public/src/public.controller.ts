import { Controller, Body, Post, Get } from '@nestjs/common';
import { Auth } from '@utils/decorators';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '@backend/email';
import { ConfigService } from '@backend/config';
import { AskDto } from './public.dto';
import { ProfilesService } from '@backend/profiles';
import { RequestsService } from '@backend/requests';
import { UsersService } from '@backend/users';
import { Statistics } from './public.model';

@Controller('v1/public')
@ApiTags('public')
export class PublicController {
  constructor(
    private email: EmailService,
    private config: ConfigService,
    private profiles: ProfilesService,
    private requests: RequestsService,
    private users: UsersService
  ) {}

  @Auth('anonymous')
  @Post('ask')
  public async ask(@Body() body: AskDto): Promise<void> {
    const { email, name, content } = body;
    await this.email.send(
      this.config.emails.publicRelations,
      `${name} has a question in Komak`,
      `from: ${email} ${content}`
    );
  }

  @Auth('admin')
  @Get('statistics')
  public async getStats(): Promise<Statistics> {
    const users = await this.users.getStats();
    const requests = await this.requests.getStats();
    const profiles = await this.profiles.getStats();
    return { users, profiles, requests };
  }
}
