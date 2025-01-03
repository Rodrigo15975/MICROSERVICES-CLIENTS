import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { configPublish } from './common/config-rabbitMQ'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'

@Injectable()
export class ClientsService {
  constructor(private readonly amqpConnection: AmqpConnection) {}

  @RabbitSubscribe({
    queue: configPublish.QUEUE_CREATE_COUPON,
    routingKey: configPublish.ROUTING_ROUTINGKEY_CREATE_COUPON,
    exchange: configPublish.ROUTING_EXCHANGE_CREATE_COUPON,
  })
  async create(createClientDto: CreateClientDto) {
    console.log({
      message: 'recieved message:',
      createClientDto,
    })
    await this.amqpConnection.publish(
      configPublish.ROUTING_EXCHANGE_CREATE_COUPON_WRITE,
      configPublish.ROUTING_ROUTINGKEY_CREATE_COUPON_WRITE,
      createClientDto,
    )
  }

  findAll() {
    console.log({
      message: 'recieved message in findAll:',
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} client`
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    console.log({
      updateClientDto,
    })

    return `This action updates a #${id} client`
  }

  remove(id: number) {
    return `This action removes a #${id} client`
  }
}
