import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
import { Logger } from '@nestjs/common'
dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
})
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(
    process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  )
  const PORT = Number(process.env.PORT) || 8085
  await app.listen(PORT, () => {
    if (process.env.NODE_ENV === 'development')
      return Logger.debug(
        'listening on port:',
        PORT,
        `NODE_ENV: ${process.env.NODE_ENV} `,
      )
    Logger.log(
      'listening on port: ',
      PORT,
      ` NODE_ENV: ${process.env.NODE_ENV} `,
    )
  })
}
bootstrap()
