import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Configurar interceptor global de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma automáticamente los tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 400,
    }),
  );

  // Configurar CORS
  if (process.env.NODE_ENV === 'development') {
    // En desarrollo, permitir todos los orígenes
    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
      ],
    });
  } else {
    // En producción, ser más restrictivo
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        process.env.CORS_ORIGIN || 'http://localhost:4200',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  }

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('xQore API')
    .setDescription(
      `
    API del sistema xQore con autenticación JWT
    
    ## Autenticación
    
    La mayoría de endpoints requieren autenticación JWT. Para autenticarte:
    
    1. Usa el endpoint \`POST /auth/register\` o \`POST /auth/login\`
    2. Copia el \`access_token\` de la respuesta
    3. Haz clic en el botón "Authorize" 🔒 arriba
    4. Introduce: \`Bearer <tu-access-token>\`
    5. Haz clic en "Authorize"
    
    ## Roles y Permisos
    
    - **superadmin**: Control total del sistema
    - **admin**: Gestión administrativa y asignación de roles  
    - **usuario**: Acceso básico de lectura
    `,
    )
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y registro de usuarios')
    .addTag('roles', 'Gestión de roles y permisos (Requiere autenticación)')
    .addTag('users', 'Gestión de usuarios (Requiere autenticación)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT Token',
        description:
          'Token JWT obtenido del login/registro. Formato: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'xQore API Documentation',
    customCss: `
      .topbar-wrapper img { content: url('data:image/svg+xml;base64,'); }
      .swagger-ui .topbar { background-color: #1f2937; }
    `,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
