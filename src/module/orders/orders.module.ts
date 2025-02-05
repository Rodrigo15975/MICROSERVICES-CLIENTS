import { Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { configExchange, configQueue } from './common/config-rabbit'
import { PrismaService } from 'src/prisma/prisma.service'
import { CacheModule } from '../cache/cache.module'
import { NotificationEmailModule } from '../notification-email/notification-email.module'

@Module({
  imports: [
    CacheModule,
    NotificationEmailModule,
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env' : '.env.production',
    }),
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useFactory: (config: ConfigService) => ({
        exchanges: configExchange,
        queues: configQueue,
        uri: config.getOrThrow<string>('RABBITMQ_URL'),
        connectionInitOptions: { wait: false },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [OrdersService, PrismaService],
})
export class OrdersModule {}
