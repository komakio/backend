import { Controller, Body, Post } from '@nestjs/common';
import { Auth } from '@utils/decorators';
import { ApiTags } from '@nestjs/swagger';
import { EmailService } from '@backend/email';
import { ConfigService } from '@backend/config';
import { AskDto } from './public.dto';
import { getAskTemplate } from '@utils/templates';

@Controller('v1/public')
@ApiTags('public')
export class PublicController {
  constructor(private email: EmailService, private config: ConfigService) {}

  @Auth('anonymous')
  @Post('ask')
  public async ask(@Body() body: AskDto): Promise<void> {
    const { email, name, content } = body;
    await this.email.send(
      this.config.emails.publicRelations,
      `${name} has a question in Komak`,
      getAskTemplate({ name, email, content })
    );
  }
}
