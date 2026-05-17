import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from './common/logger/logger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.APP_PORT || 3000;
  await app.listen(port);

  logger.info(`애플리케이션이 포트 ${port}에서 시작되었습니다.`);
}

bootstrap().catch((error) => {
  console.error('애플리케이션 시작 실패:', error);
  process.exit(1);
});
