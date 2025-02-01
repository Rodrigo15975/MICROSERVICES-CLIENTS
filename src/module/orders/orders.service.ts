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
import { randomUUID } from 'crypto'
import { PrismaService } from 'src/prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import { configRabbit } from './common/config-rabbit'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly ordersClientCache: string = `ordersClientCache:${randomUUID().toString()} `
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cache: CacheService,
    private readonly amqAconnection: AmqpConnection,
  ) {}

  @RabbitSubscribe({
    queue: configRabbit.ROUTING_QUEUE_CREATE_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_CREATE_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_CREATE_ORDERS,
    // messageTtl → Elimina los mensajes, pero la cola sigue existiendo.
    //   // ✅ expires → Elimina la cola si no se usa, pero si sigue recibiendo mensajes, no se
  })
  async create(@RabbitPayload() createOrderDto: CreateOrderDto) {
    try {
      const {
        userId: userIdGoogle,
        amount_total,
        statusPayment,
      } = createOrderDto
      await this.createOrders(userIdGoogle, amount_total, statusPayment)
    } catch (error) {
      this.logger.error('Error create order', error)
      throw new InternalServerErrorException(error)
    }
  }

  @RabbitSubscribe({
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS,
    queue: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS,
    queueOptions: {
      messageTtl: 60000,
    },
  })
  async getAllOrdersDirectly(@RabbitPayload() payload: OrdersClient) {
    await this.cache.set(this.ordersClientCache, payload, '10m')
  }
  async createOrders(
    userIdGoogle: string,
    amount_total: string,
    statusPayment: 'paid',
  ) {
    try {
      this.logger.debug('Create order')
      const orders = await this.cache.get<OrdersClient>(this.ordersClientCache)
      if (!orders) return
      await this.orders(orders, userIdGoogle, amount_total, statusPayment)
      this.amqAconnection.publish(
        configRabbit.EXCHANGE_NAME_DECREMENTE_STOCK,
        configRabbit.ROUTING_KEY_DECREMENTE_STOCK,
        orders,
      )
    } catch (error) {
      this.logger.error('Error create order many', error)
      throw new InternalServerErrorException(error)
    }
  }
  private async orders(
    orders: OrdersClient,
    userIdGoogle: string,
    amount_total: string,
    statusPayment: 'paid',
  ) {
    await this.prismaService.orders.create({
      data: {
        amount_total,
        OrdersItems: {
          create: orders.dataFormat.map(
            ({
              product,
              brand,
              quantity_buy,
              category,
              discount,
              price,
              productVariant,
              size,
              description,
            }) => ({
              product,
              brand,
              quantity: quantity_buy,
              categorie: category.category,
              discount,
              price,
              ordersVariants: {
                create: productVariant.map((variant) => ({
                  color: variant.color,
                  url: variant.url,
                })),
              },
              size,
              description,
              status: statusPayment,
            }),
          ),
        },
        Clients: {
          connect: {
            userIdGoogle,
          },
        },
      },
    })
    this.logger.debug('Order created....')
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
