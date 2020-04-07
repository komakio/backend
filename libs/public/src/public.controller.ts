import { Controller, Body, Post } from '@nestjs/common';
import { IsString } from 'class-validator';
import { Auth } from '@utils/decorators';
import { ApiProperty, ApiTags, ApiResponse } from '@nestjs/swagger';
import { EmailService } from '@backend/email';

class AskDto {
  @IsString()
  @ApiProperty()
  public email?: string;
  @IsString()
  @ApiProperty()
  public subject?: string;
  @IsString()
  @ApiProperty()
  public content?: string;
}

@Controller('v1/public')
@ApiTags('public')
export class PublicController {
  constructor(private email: EmailService) {}

  @Auth('anonymous')
  @Post('ask')
  @ApiResponse({
    description: 'Successfully sent email.',
  })
  public async ask(@Body() body: AskDto): Promise<void> {
    const { email, subject, content } = body;
    await this.email.send(email, subject, content);
  }
}
