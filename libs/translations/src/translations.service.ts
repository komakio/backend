import { Injectable } from '@nestjs/common';
import { ConfigService } from '@backend/config';
import { LoggerService } from '@backend/logger';
import Axios from 'axios';

@Injectable()
export class TranslationsService {
  constructor(private config: ConfigService, private logger: LoggerService) {}

  public async get() {
    const { apiKey, projectId } = this.config.crowdin;

    const file = await Axios.get(
      `https://api.crowdin.com/api/project/${projectId}/download/all.zip?key=${apiKey}`
    );
  }

  private async makeZip() {
    const { apiKey, projectId } = this.config.crowdin;

    const res = await Axios.get(
      `https://api.crowdin.com/api/project/${projectId}/export?key=${apiKey}`
    );
  }
}
