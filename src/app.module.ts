import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParserController } from './controllers/parser/parserController';
import { ParserService } from './services/parser/parserService';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
  ],
  controllers: [AppController, ParserController, ParserController],
  providers: [AppService, ParserService],
})
export class AppModule {}
