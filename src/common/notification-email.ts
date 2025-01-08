import { SendSmtpEmail } from '@getbrevo/brevo'

export const formatEmail = (
  emailTo: string,
  nameTo: string,
  senderEmail: string,
  senderName: string,
) => {
  const notificationEmail = new SendSmtpEmail()
  notificationEmail.subject = 'You have a 20% discount on any product'
  notificationEmail.to = [{ name: nameTo, email: emailTo }]
  notificationEmail.htmlContent = `
    <h1>
    You have a 20% discount on any product
    </h1>
  `
  notificationEmail.templateId = 2
  notificationEmail.sender = {
    name: senderName,
    email: senderEmail,
  }

  return notificationEmail
}
