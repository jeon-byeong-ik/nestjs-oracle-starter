import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Logger } from '../logger/logger';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '서버 오류가 발생했습니다.';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const objResponse = exceptionResponse as Record<string, unknown>;
        message =
          (objResponse.message as string) || exception.message || message;
        error = (objResponse.error as string) || error;
      } else {
        message = exception.message || message;
      }
    } else if (exception instanceof Error) {
      this.logger.error(`예상치 못한 에러: ${exception.message}`, exception);
      message = exception.message;
    } else {
      this.logger.error('알 수 없는 에러 발생', exception);
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
