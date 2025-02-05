import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import * as brevo from '@getbrevo/brevo'

@Injectable()
export class NotificationEmailService {
  private readonly apiInstance = new brevo.TransactionalEmailsApi()
  private readonly notificationEmail = new brevo.SendSmtpEmail()
  constructor() {
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    )
  }
  /**
   * sendEmailDetailsFactura
   */
  public async sendEmailDetailsPayment(details: DetailsPayment) {
    try {
      const { emailTo: email, nameTo: name, product, urlProduct } = details
      this.notificationEmail.subject = 'Details order'
      this.notificationEmail.htmlContent = `
        <p>
        Details product
        </p>
        `
      this.notificationEmail.to = [{ name, email }]
      this.notificationEmail.templateId = 3
      this.notificationEmail.params = {
        product,
        IMG: urlProduct,
      }
      await this.apiInstance.sendTransacEmail(this.notificationEmail)
    } catch (error) {
      Logger.error('Error while sending email', error)
      throw new InternalServerErrorException(error)
    }
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
