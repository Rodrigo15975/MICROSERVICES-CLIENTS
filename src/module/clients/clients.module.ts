import { Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
// import { ClientsController } from './clients.controller'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { configExchange, configQueue } from './common/config-rabbitMQ'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from 'src/prisma/prisma.module'
import { CacheModule } from '../cache/cache.module'

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('RABBITMQ_URL'), // Usuario, contraseña y puerto
        queues: configQueue,
        exchanges: configExchange,

        connectionInitOptions: {
          wait: false,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ClientsService],
})
export class ClientsModule {}
