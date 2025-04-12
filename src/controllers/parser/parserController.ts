import {
  Controller,
  Post,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from '../../services/parser/parserService';
import { ParsedData } from '../../interfaces/ParsedData.interface';
import { Express } from 'express';
import { ApiResponse, sendResponse } from '../../utils/response.utils';
import { BasedRouter } from '../../constant/routes';
import { MulterError } from 'multer';
import * as multer from 'multer';

@Controller(BasedRouter.PARSER.BASE)
export class ParserController {
  private readonly logger: Logger;

  constructor(private readonly parserService: ParserService) {
    this.logger = new Logger(ParserController.name);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file || file.mimetype !== 'application/pdf') {
          const error = new MulterError('LIMIT_UNEXPECTED_FILE');
          error.message = 'Only PDF files are allowed';
          return cb(error, false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<ParsedData>> {
    try {
      if (!file || !('buffer' in file) || !('originalname' in file)) {
        this.logger.warn('No valid file uploaded');
        throw new BadRequestException('No valid file uploaded');
      }

      this.logger.log(
        `Received file: ${file.originalname}, size: ${file.buffer.length} bytes`,
      );
      const data = await this.parserService.extractFileInfo(file.buffer);
      this.logger.log(`Parsed data: ${JSON.stringify(data)}`);
      return sendResponse(data, 'Parsed data completed!');
    } catch (error) {
      this.logger.error(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
