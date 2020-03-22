import { Injectable, Logger as NestLogger } from '@nestjs/common';

@Injectable()
export class LoggerService extends NestLogger {
  public _log: (message: any, context?: string) => void;

  constructor(onlyImportant = false) {
    super();
    if (onlyImportant) {
      this.debug = () => {
        // do nothing.
      };
      this.log = () => {
        // do nothing.
      };
    } else {
      this._log = this.log;
      this.log = (value: any, context?: string) => {
        if (!this.isAcceptedLog(value)) {
          return;
        }
        this._log(value, context);
      };
    }
  }

  private isAcceptedLog(value: any) {
    if (typeof value !== 'string') {
      return true;
    }

    if (
      value.includes('dependencies initialized') ||
      value.includes('Nest microservice successfully started') ||
      value.includes('Controller {/') ||
      value.includes('Mapped {/') ||
      value.includes('Nest application successfully started') ||
      value.includes('Starting Nest application...')
    ) {
      return false;
    }

    return true;
  }
}
