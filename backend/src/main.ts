import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigins(): string[] {
  const corsAllowedOrigins = parseCorsOrigins(process.env.CORS_ALLOWED_ORIGINS);
  const corsOrigin = parseCorsOrigins(process.env.CORS_ORIGIN);
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  return Array.from(
    new Set([
      'http://localhost:3000',
      'http://localhost:3001',
      'https://vayento-monorepo.vercel.app',
      ...corsAllowedOrigins,
      ...corsOrigin,
      ...(frontendUrl ? [frontendUrl] : []),
    ]),
  );
}

function isAllowedVercelPreview(origin: string): boolean {
  return origin.endsWith('.vercel.app') && origin.includes('vayento-monorepo');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = getAllowedOrigins();

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const isAllowedExact = allowedOrigins.includes(origin);
      const isAllowedPreview = isAllowedVercelPreview(origin);

      if (isAllowedExact || isAllowedPreview) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Stripe-Signature'],
  });

  const port = Number(process.env.PORT ?? 4000);

  await app.listen(port, '0.0.0.0');
}

bootstrap();