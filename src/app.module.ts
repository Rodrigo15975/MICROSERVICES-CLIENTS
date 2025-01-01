import { Module } from '@nestjs/common'
import { ClientsModule } from './module/clients/clients.module'
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq'
import {
  configExchange,
  configQueue,
} from './module/clients/common/config-rabbitMQ'

@Module({
  imports: [
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://guest:guest@localhost:5672', // Usuario, contraseña y puerto
      queues: configQueue,
      exchanges: configExchange,

      connectionInitOptions: {
        wait: false,
      },
    }),
    ClientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
