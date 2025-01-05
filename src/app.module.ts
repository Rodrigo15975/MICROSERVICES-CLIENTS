import { Module } from '@nestjs/common'
import { ClientsModule } from './module/clients/clients.module'
import { PrismaModule } from './prisma/prisma.module'

@Module({
  imports: [ClientsModule, PrismaModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
