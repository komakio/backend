import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { AxiosError } from 'axios';
import { RmqContext } from '@nestjs/microservices';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private exceptions: ExceptionsService) {}

  public catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();

    if (request) {
      this.catchApiException(exception, host);
      return;
    }

    const rabbitMQContext = host.getArgByIndex(1);
    if (rabbitMQContext instanceof RmqContext) {
      this.catchRabbitMQException(exception, rabbitMQContext);
    }
  }

  private catchRabbitMQException(
    exception: HttpException | Error,
    context: RmqContext
  ) {
    const message = context.getMessage();
    const content = message.content.toString('utf-8');
    let jsonContent = content;
    try {
      jsonContent = JSON.parse(content);
    } catch {}

    this.exceptions.report(exception, {
      content: jsonContent,
      ...message.fields,
    });
  }

  private catchApiException(
    exception: HttpException | Error,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const path = request.originalUrl;

    if (exception instanceof HttpException) {
      const code = exception.getStatus();
      response.code(code).send({
        error: {
          statusCode: code,
          message: exception.getResponse(),
        },
        timestamp: new Date().toISOString(),
        path,
      });
      return;
    }

    const baseInfo = {
      path,
      body: request.body,
      query: request.query,
      params: request.params,
      user: request.user,
    };
    if ((exception as AxiosError).isAxiosError) {
      const error = exception as AxiosError;

      const url = error.config.url;
      const method = error.config.method.toUpperCase();
      const status = error.response?.status;
      const statusText = error.response?.statusText;

      this.exceptions.report(
        new Error(`${method} ${url} failed: ${status} ${statusText}`),
        {
          ...baseInfo,
          isAxios: true,
          url,
          method,
          status,
          statusText,
          data: error.config?.data,
          result: error.response?.data,
        }
      );
    } else {
      this.exceptions.report(exception, baseInfo);
    }

    response.code(HttpStatus.INTERNAL_SERVER_ERROR).send({
      error: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      },
      timestamp: new Date().toISOString(),
      path,
    });
  }
}
