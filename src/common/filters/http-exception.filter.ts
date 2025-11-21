import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Only handle HTTP context - GraphQL errors are handled by Apollo Server
    const contextType = host.getType();
    if (contextType !== 'http') {
      // For GraphQL or other contexts, just log and let Apollo handle it
      this.logger.error(
        `Error in ${contextType} context`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Safety check - if request/response are undefined, log and return
    if (!request || !response) {
      this.logger.error(
        'Request or response is undefined',
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url || 'unknown',
      method: request.method || 'unknown',
      message:
        typeof message === 'string'
          ? message
          : (message as any).message || 'An error occurred',
      ...(typeof message === 'object' && (message as any).error
        ? { error: (message as any).error }
        : {}),
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json(errorResponse);
  }
}
