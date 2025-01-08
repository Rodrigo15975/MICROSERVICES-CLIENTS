import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as dotenv from 'dotenv'
// import { HttpExceptionFilter } from './common/catch.exception.filter'
dotenv.config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const PORT = process.env.PORT || 8085
  await app.listen(PORT)
  console.log(`Server running on port, ${PORT}`)
}
bootstrap()
