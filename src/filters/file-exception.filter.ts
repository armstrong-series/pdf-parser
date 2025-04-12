import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'File upload error';

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large. Max allowed size is 10MB.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message =
          'Unexpected field: Make sure the uploaded field name is "file".';
        break;
    }

    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message,
    });
  }
}
