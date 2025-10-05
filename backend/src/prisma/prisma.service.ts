import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    try {
      // Usar una referencia explícita al método
      await (this as PrismaClient).$connect();
      console.log('📊 Conexión a la base de datos establecida');
    } catch (error) {
      console.error('❌ Error al conectar a la base de datos:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      // Usar una referencia explícita al método
      await (this as PrismaClient).$disconnect();
      console.log('📊 Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar la conexión:', error);
    }
  }
}
