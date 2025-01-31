import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
dotenv.config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  )
  const PORT = process.env.PORT || 8085
  await app.listen(PORT, () => {
    if (process.env.NODE_ENV === 'development')
      return console.log(
        'listening on port:',
        PORT,
        `\nNODE_ENV: ${process.env.NODE_ENV} `,
      )
    console.log(
      'listening on port:',
      PORT,
      `\nNODE_ENV: ${process.env.NODE_ENV} `,
    )
  })
}
bootstrap()
