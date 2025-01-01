import { Injectable } from '@nestjs/common'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { configPublish } from './common/config-rabbitMQ'

@Injectable()
export class ClientsService {
  @RabbitSubscribe({
    queue: 'clients',
    routingKey: configPublish.ROUTING_ROUTINGKEY_CREATE_COUPON,
    exchange: configPublish.ROUTING_EXCHANGE_CREATE_COUPON,
  })
  create(createClientDto: CreateClientDto) {
    console.log({
      message: 'recieved message:',
      createClientDto,
    })
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
