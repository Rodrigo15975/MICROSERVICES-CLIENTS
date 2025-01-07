import { Module } from '@nestjs/common'
import { NotificationEmailService } from './notification-email.service'

@Module({
  imports: [],
  providers: [NotificationEmailService],
  exports: [NotificationEmailService],
})
export class NotificationEmailModule {}
