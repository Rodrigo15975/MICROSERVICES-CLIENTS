import { RabbitPayload, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable, Logger } from '@nestjs/common'
import { configRabbit } from './common/config-rabbit'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  constructor(private readonly prismaService: PrismaService) {}

  @RabbitSubscribe({
    queue: configRabbit.ROUTING_QUEUE_CREATE_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_CREATE_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_CREATE_ORDERS,
  })
  create(@RabbitPayload() createOrderDto: CreateOrderDto) {
    try {
      const {
        // userId: userIdGoogle,
        productIds: productIds,
        // amount_total,
      } = createOrderDto
      const data = this.getAllDataProducts()
      console.log({
        data,
      })

      const getIdsProducts: string[] = this.getIdsProducts(productIds)
      // this.prismaService.orders.create({
      //   data: {
      //     amount_total: amount_total,
      //     clientsId: userIdGoogle,
      //     OrdersItems: {
      //       createMany: {
      //         data: getIdsProducts.map((id) => ({
      //           productId: id,
      //         })),
      //       },
      //     },
      //     Clients: {
      //       connect: {
      //         userIdGoogle,
      //       },
      //     },
      //   },
      // })
      this.logger.verbose(`createOrderDto: ${JSON.stringify(getIdsProducts)}`)
    } catch (error) {
      this.logger.error('Error create order', error)
    }
  }

  getIdsProducts(productIds: string) {
    const getIdsProducts: string[] = JSON.parse(productIds)
    return getIdsProducts
  }

  @RabbitSubscribe({
    queue: configRabbit.ROUTING_QUEUE_SEND_DATA_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_SEND_DATA_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_SEND_DATA_ORDERS,
  })
  getAllDataProducts(@RabbitPayload() data?: any) {
    console.log({
      data,
    })
  }

  findAll() {
    return `This action returns all orders`
  }

  findOne(id: number) {
    return `This action returns a #${id} order`
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    console.log({
      updateOrderDto,
    })

    return `This action updates a #${id} order`
  }

  remove(id: number) {
    return `This action removes a #${id} order`
  }
}
