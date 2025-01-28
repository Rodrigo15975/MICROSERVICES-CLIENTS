import { Module } from '@nestjs/common'
import { ClientsModule } from './module/clients/clients.module'
import { PrismaModule } from './prisma/prisma.module'
import { NotificationEmailModule } from './module/notification-email/notification-email.module'
import { OrdersModule } from './module/orders/orders.module'

@Module({
  imports: [ClientsModule, PrismaModule, NotificationEmailModule, OrdersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
