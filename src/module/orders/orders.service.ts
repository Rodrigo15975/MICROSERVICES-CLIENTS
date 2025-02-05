import {
  AmqpConnection,
  RabbitPayload,
  RabbitRPC,
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
import { NotificationEmailService } from '../notification-email/notification-email.service'

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name)
  private readonly ordersClientCache: string = `ordersClientCache:${randomUUID().toString()}`
  private readonly ordersCacheByIdClient: string = `ordersCacheByIdClient:${randomUUID().toString()}`
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cache: CacheService,
    private readonly amqAconnection: AmqpConnection,
    private readonly notificationEmail: NotificationEmailService,
  ) {}

  @RabbitRPC({
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS_CLIENT_ID,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS_CLIENT_ID,
    queue: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS_CLIENT_ID,
  })
  async getAllOrderByIdClient(userIdGoogle: string) {
    this.logger.debug(userIdGoogle)
    try {
      const getAllOrderByIdClientCache = await this.cache.get(
        this.ordersCacheByIdClient,
      )
      if (getAllOrderByIdClientCache) return getAllOrderByIdClientCache
      const getAllOrderByIdClient = await this.prismaService.orders.findMany({
        where: {
          Clients: {
            userIdGoogle,
          },
        },
        include: {
          OrdersItems: {
            include: {
              ordersVariants: true,
            },
          },
        },
      })
      await this.cache.set(
        this.ordersCacheByIdClient,
        getAllOrderByIdClient,
        '1d',
      )
      return getAllOrderByIdClient
    } catch (error) {
      this.logger.error('Error get all order by id client', error)
      throw new InternalServerErrorException(error)
    }
  }

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
        emailUser,
        codeUsed,
      } = createOrderDto
      await this.createOrders(
        userIdGoogle,
        amount_total,
        statusPayment,
        emailUser,
        codeUsed,
      )
      await this.cache.delete(this.ordersClientCache)
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
    emailUser: string,
    codeUsed: string,
  ) {
    try {
      const orders = await this.cache.get<OrdersClient>(this.ordersClientCache)
      if (!orders) return
      await this.orders(orders, userIdGoogle, amount_total, statusPayment)
      await this.sendDetailsOrders(orders, emailUser)
      this.amqAconnection.publish(
        configRabbit.EXCHANGE_NAME_DECREMENTE_STOCK,
        configRabbit.ROUTING_KEY_DECREMENTE_STOCK,
        orders,
      )
      const codeUseBooleanParse = codeUsed === 'false' ? false : true
      if (codeUseBooleanParse)
        await this.desactivedCouponForClient(userIdGoogle)
    } catch (error) {
      this.logger.error('Error create order many', error)
      throw new InternalServerErrorException(error)
    }
  }
  private async desactivedCouponForClient(userIdGoogle: string) {
    this.logger.debug("Coupon's was used for client", userIdGoogle)
    await this.prismaService.clients.update({
      data: {
        coupon: {
          update: {
            expired: true,
          },
        },
      },
      where: {
        userIdGoogle,
      },
    })
    this.logger.debug("Coupon's was used for client", userIdGoogle)
  }

  private async sendDetailsOrders(orders: OrdersClient, emailUser: string) {
    const { dataFormat } = orders
    dataFormat.forEach((order, i) => {
      order.productVariant.forEach(async (variant) => {
        this.logger.debug('Send details payment', i)
        await this.notificationEmail.sendEmailDetailsPayment({
          emailTo: emailUser,
          nameTo: 'client',
          product: order.product,
          urlProduct: variant.url,
        })
      })
    })
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
                create: productVariant.map((variants) => ({
                  color: variants.color,
                  url: variants.url,
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
}
