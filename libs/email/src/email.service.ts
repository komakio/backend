import { Injectable } from '@nestjs/common';
import mjml2html from 'mjml';
import Mailgun from 'mailgun-js';
import { ConfigService } from '@backend/config';

export interface EmailServiceInterface {
  send(email: string, subject: string, content: string): Promise<void>;
}

@Injectable()
export class EmailService implements EmailServiceInterface {
  private mailgun = new Mailgun({
    apiKey: this.config.mailgun.apiKey,
    domain: this.config.mailgun.domain,
    host: 'api.eu.mailgun.net',
  });

  constructor(private config: ConfigService) {}

  public async send(
    email: string,
    subject: string,
    content: string,
    tag?: string,
    from = 'Komak.io'
  ): Promise<void> {
    const parameters: Mailgun.messages.SendData = {
      from: `${from} <${this.config.mailgun.from}>`,
      html: mjml2html(content, {
        keepComments: false,
      }).html,
      subject,
      to: email,
    };
    if (tag) {
      parameters['o:tag'] = tag;
    }

    await this.mailgun.messages().send(parameters);
  }
}
