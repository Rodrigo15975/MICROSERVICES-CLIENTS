import {
  AmqpConnection,
  RabbitPayload,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq'
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { configRabbit } from './common/config-rabbit'
import { CreateOrderDto, Orders } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { randomUUID } from 'crypto'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly correlationId: string = randomUUID().toString()
  constructor(
    private readonly prismaService: PrismaService,
    private readonly amqConnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    queue: configRabbit.ROUTING_QUEUE_CREATE_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_CREATE_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_CREATE_ORDERS,
  })
  async create(@RabbitPayload() createOrderDto: CreateOrderDto) {
    this.logger.debug(createOrderDto)
    try {
      const {
        // userId: userIdGoogle,
        productIds: productIds,
        // amount_total,
      } = createOrderDto
      const getIdsProducts: string[] = this.getIdsProducts(productIds)
      const productFilters = await this.getProductsFiltersByIds(getIdsProducts)
      const orders = this.getAllOrders()
      console.log({
        orders,
      })

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
    } catch (error) {
      this.logger.error('Error create order', error)
    }
  }
  @RabbitSubscribe({
    queue: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    // messageTtl → Elimina los mensajes, pero la cola sigue existiendo.
    // ✅ expires → Elimina la cola si no se usa, pero si sigue recibiendo mensajes, no se elimina y los
  })
  private getAllOrders(@RabbitPayload() orders?: Orders) {
    return orders
  }

  private async getProductsFiltersByIds(ids: string[]) {
    const getAllDataProducts = await this.getAllDataProducts()
    const productsIncludesId = getAllDataProducts.filter((item) =>
      ids.includes(item.id.toString()),
    )
  }

  getIdsProducts(productIds: string) {
    return JSON.parse(productIds) as string[]
  }

  private async getAllDataProducts(): Promise<ProductFindAll[]> {
    try {
      return await this.amqConnection.request<ProductFindAll[]>({
        exchange: configRabbit.ROUTING_EXCHANGE_SEND_DATA_ORDERS,
        routingKey: configRabbit.ROUTING_ROUTINGKEY_SEND_DATA_ORDERS,
        payload: {},
        // "persistent": true → Hace que el mensaje sea persistente, lo que significa que se guardará en disco en caso de que el broker RabbitMQ se reinicie o falle.
        publishOptions: {
          persistent: true,
        },
        headers: {
          'content-type': 'application/json',
          'content-encoding': 'utf-8',
        },
        expiration: 30000,
        timeout: 30000,
        correlationId: this.correlationId,
      })
    } catch (error) {
      this.logger.error('Error get all PRODUCT IN DB-READ-PRODUCTS', error)
      throw new InternalServerErrorException(error.message, error.status)
    }
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
