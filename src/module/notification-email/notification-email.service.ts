import { Injectable } from '@nestjs/common'
import { MailtrapClient } from 'mailtrap'

const TOKEN = '4e856d7f78011592ec73a570e2149716'
// const SENDER_EMAIL = 'sandbox.api.mailtrap.io'
// const RECIPIENT_EMAIL = 'rodrigorumpler@gmail.com'

@Injectable()
export class NotificationEmailService {
  private readonly client = new MailtrapClient({
    token: TOKEN,
    testInboxId: 3376454,
    accountId: 1,
  })

  /**
   * @SendEmail
   */
  public async sendEmail() {
    try {
      await this.client.testing.send({
        from: {
          email: 'hello@example.com',
          name: 'Mailtrap Test',
        },
        to: [
          {
            email: 'rodrigorumpler@gmail.com',

            name: 'Rodrigo',
          },
        ],
        subject: 'You are awesome!',
        text: 'Congrats for sending test email with Mailtrap!',
        category: 'Integration Test',
      })
    } catch (error) {
      console.error({ error })
    }
  }
}
