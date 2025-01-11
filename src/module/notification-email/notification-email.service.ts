import { Injectable, Logger } from '@nestjs/common'
import * as brevo from '@getbrevo/brevo'
// import { formatEmail } from 'src/common/notification-email'

@Injectable()
export class NotificationEmailService {
  private readonly apiInstance = new brevo.TransactionalEmailsApi()
  private notificationEmail = new brevo.SendSmtpEmail()
  constructor() {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    )
  }

  /**
   * @SendEmail
   */
  public async sendEmail(nameTo: string, emailTo: string, code: string) {
    try {
      if (!emailTo || !nameTo) return
      this.notificationEmail.subject = 'You have a 20% discount on any product'
      this.notificationEmail.to = [{ name: nameTo, email: emailTo }]
      this.notificationEmail.htmlContent = `
        <p>
        You have a 20% discount on any product 

        </p>
        `
      this.notificationEmail.templateId = 2
      this.notificationEmail.params = {
        CODE: code,
      }
      this.notificationEmail.sender = {
        name: 'RDG E-COMMERCE',
        email: 'rodrigorumpler@gmail.com',
      }

      await this.apiInstance.sendTransacEmail(this.notificationEmail)

      Logger.verbose(
        `Email sent successfully for email ${emailTo} with name: ${nameTo} `,
        NotificationEmailService.name,
      )
      return
    } catch (error) {
      Logger.fatal('Error while sending email')
      if (error.response && error.response.body)
        Logger.error(
          `Error details: ${JSON.stringify(error.response.body)}`,
          NotificationEmailService.name,
        )

      Logger.error(error.message, NotificationEmailService.name)
    }
  }
}
