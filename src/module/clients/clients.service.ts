import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { PrismaService } from 'src/prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import { NotificationEmailService } from '../notification-email/notification-email.service'
import { CACHE_NAME_ONLY_COUPONS } from './common/cache-name'
import { configPublish } from './common/config-rabbitMQ'
import { HandledRpcException } from './common/handle-errorst'
import { CouponForNewClient, CreateClientDto } from './dto/create-client.dto'
import { getDataForCreateCoupon } from './utils/getDataForCreateCoupon'
import { expiredDateVerification } from './utils/verificationDate'
@Injectable()
export class ClientsService {
  private readonly logger: Logger = new Logger(ClientsService.name)
  private readonly limiter = new Bottleneck({
    maxConcurrent: 5,
    minTime: 300,
    clusterNodes: 5,
    maxRetries: 5,
  })

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cacheService: CacheService,
    private readonly notificationEmail: NotificationEmailService,
  ) {
    this.limiter.on('executing', (task) => {
      this.logger.verbose('Executing task:', task.options.id)
    })
  }

  @RabbitRPC({
    queue: configPublish.QUEUE_VERIFY_COUPON_COUDE,
    routingKey: configPublish.ROUTING_ROUTINGKEY_VERIFY_COUPON_COUDE,
    exchange: configPublish.ROUTING_EXCHANGE_VERIFY_COUPON_COUDE,
  })
  async verifyDiscountCouponOfClient({
    code,
    userIdGoogle,
  }: {
    code: string
    userIdGoogle: string
  }) {
    await this.verifyClientExistedWithDiscount(userIdGoogle)
    const findCoupon = await this.prismaService.coupon.findUnique({
      where: {
        code,
      },
    })

    if (!findCoupon)
      return HandledRpcException.RpcExceptionRabbit(
        'Cuopon not found',
        'Coupon not found',
        HttpStatus.BAD_REQUEST,
        ClientsService.name,
      )

    const { discount, expired } = findCoupon

    if (expired)
      return HandledRpcException.RpcExceptionRabbit(
        'Coupon not found',
        'Coupon not found',
        HttpStatus.BAD_REQUEST,
        ClientsService.name,
      )

    return HandledRpcException.ResponseSuccessfullyRabbit(
      'Coupon found',
      'Apply discount',
      HttpStatus.OK,
      ClientsService.name,
      discount,
    )
    // await this.verifyEspiredCodeCoupon(code)
  }

  private async verifyClientExistedWithDiscount(userIdGoogle: string) {
    const findClient = await this.findOneClient(userIdGoogle)
    if (!findClient)
      return HandledRpcException.rpcException(
        'Client not found ',
        HttpStatus.BAD_REQUEST,
        ClientsService.name,
      )
  }

  @RabbitRPC({
    queue: configPublish.QUEUE_CREATE_COUPON,
    routingKey: configPublish.ROUTING_ROUTINGKEY_CREATE_COUPON,
    exchange: configPublish.ROUTING_EXCHANGE_CREATE_COUPON,
  })
  async createCuponIfUserNotExists(data: CreateClientDto) {
    const { emailGoogle, nameGoogle, userIdGoogle } = data
    if (!emailGoogle || !nameGoogle || !userIdGoogle) return
    return await this.createClient(userIdGoogle, emailGoogle, nameGoogle)
  }
  private async createClient(
    userIdGoogle: string,
    emailGoogle: string,
    nameGoogle: string,
  ) {
    try {
      const client = await this.findOneClient(userIdGoogle)
      if (client)
        return HandledRpcException.ResponseSuccessfullyMessagePattern(
          '',
          HttpStatus.OK,
          ClientsService.name,
          undefined,
          false,
        )
      await this.prismaService.clients.create({
        data: {
          emailGoogle,
          nameGoogle,
          userIdGoogle,
        },
      })
      this.logger.verbose('Client created successfully')
      return await this.createCouponForNewClient(
        userIdGoogle,
        emailGoogle,
        nameGoogle,
      )
    } catch (error) {
      this.logger.error('Error create client', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  private async createCouponForNewClient(
    userIdGoogle: string,
    emailGoogle: string,
    nameGoogle: string,
  ) {
    try {
      const data = getDataForCreateCoupon(userIdGoogle)
      await this.limiter.schedule(async () => {
        const createCoupon = this.prismaService.coupon.create({ data })
        const sendEmail = this.sendEmailNotification(
          emailGoogle,
          nameGoogle,
          data.code,
        )
        const deleteCache = this.cacheService.delete(CACHE_NAME_ONLY_COUPONS)
        const findCoupons = this.findAllCupons()
        await Promise.all([createCoupon, deleteCache, findCoupons, sendEmail])
      })
      this.logger.verbose(
        `Coupon created successfully for client ${userIdGoogle}`,
      )
      return HandledRpcException.ResponseSuccessfullyMessagePattern(
        'You have a coupon for all products with a 20% discount',
        HttpStatus.CREATED,
        ClientsService.name,
        undefined,
        true,
      )
    } catch (error) {
      this.logger.error('Error create coupon for new client', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  async findAllCupons() {
    try {
      const findAllClientCouponsCaching = await this.cacheService.get<
        CouponForNewClient[]
      >(CACHE_NAME_ONLY_COUPONS)

      if (findAllClientCouponsCaching) return findAllClientCouponsCaching
      const findAllClientCouponsDb = await this.prismaService.clients.findMany({
        where: {
          coupon: {
            expired: false,
          },
        },
        include: {
          coupon: true,
        },
      })
      await this.cacheService.set(
        CACHE_NAME_ONLY_COUPONS,
        findAllClientCouponsDb,
        '1d',
      )

      return findAllClientCouponsDb
    } catch (error) {
      this.logger.error('Error get all clients only coupons', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  @RabbitRPC({
    queue: configPublish.QUEUE_GET_ALL_CLIENTS,
    exchange: configPublish.ROUTING_EXCHANGE_GET_ALL_CLIENTS,
    routingKey: configPublish.ROUTING_ROUTINGKEY_GET_ALL_CLIENTS,
  })
  async findAll() {
    // skip = 0, take = 10
    try {
      return await this.prismaService.clients.findMany({
        // skip,
        // take,
        include: {
          contact: true,
          coupon: true,
          orders: true,
        },
      })
    } catch (error) {
      this.logger.error('Error get all clients', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  private async findOneClient(userIdGoogle: string) {
    return await this.prismaService.clients.findUnique({
      where: {
        userIdGoogle,
      },
    })
  }

  private async updateEspiryDate(data: CouponForNewClient) {
    const { id, coupon } = data
    const { espiryDate, code } = coupon
    const verifyEspiryDate = expiredDateVerification(espiryDate.toISOString())
    await this.prismaService.clients.update({
      data: {
        coupon: {
          update: {
            expired: verifyEspiryDate && true,
          },
        },
      },
      where: {
        id,
      },
    })
    this.logger.verbose("Coupon's expiry date has been updated: " + code)
  }
  @RabbitSubscribe({
    queue: configPublish.QUEUE_UPDATE_EXPIRY_DATE_COUPON,
    routingKey: configPublish.ROUTING_ROUTINGKEY_UPDATE_EXPIRY_DATE_COUPON,
    exchange: configPublish.ROUTING_EXCHANGE_UPDATE_EXPIRY_DATE_COUPON,
  })
  async updateEspiryDateCouponForNewClient() {
    try {
      const allClients = await this.findAllCupons()
      const updatePromises = allClients.map((coupons) =>
        this.limiter.schedule(() => this.updateEspiryDate(coupons)),
      )
      await Promise.all(updatePromises)
      await this.cacheService.delete(CACHE_NAME_ONLY_COUPONS)
    } catch (error) {
      this.logger.error('Error coupon espiry date of client', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  async sendEmailNotification(
    emailGoogle: string,
    nameGoogle: string,
    code: string,
  ) {
    await this.notificationEmail.sendEmail(nameGoogle, emailGoogle, code)
  }

  @RabbitRPC({
    queue: configPublish.QUEUE_GET_ONE_CLIENT,
    routingKey: configPublish.ROUTING_ROUTINGKEY_GET_ONE_CLIENT,
    exchange: configPublish.ROUTING_EXCHANGE_GET_ONE_CLIENT,
  })
  async findOne({ userIdGoogle }: { userIdGoogle: string }) {
    try {
      const client = await this.getOneClientAllData(userIdGoogle)
      this.logger.verbose('Return data client DB: ' + userIdGoogle)
      return client
    } catch (error) {
      this.logger.error('Error get only client', error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  /**
   * @findOneVerify
   */
  @RabbitRPC({
    queue: configPublish.QUEUE_GET_ONE_CLIENT_VERIFY,
    routingKey: configPublish.ROUTING_ROUTINGKEY_GET_ONE_CLIENT_VERIFY,
    exchange: configPublish.ROUTING_EXCHANGE_GET_ONE_CLIENT_VERIFY,
  })
  async findOneVerify({
    userIdGoogle,
    verify,
  }: {
    userIdGoogle: string
    verify: boolean
  }) {
    if (verify) return await this.existingClient(userIdGoogle)
  }

  private async existingClient(userIdGoogle: string) {
    return await this.prismaService.clients.findUnique({
      where: {
        userIdGoogle,
      },

      include: {
        contact: false,
        _count: false,
        coupon: false,
        orders: false,
      },
    })
  }

  private async getOneClientAllData(userIdGoogle: string) {
    return await this.prismaService.clients.findUnique({
      where: {
        userIdGoogle,
      },
      include: {
        coupon: true,
        orders: true,
        contact: true,
      },
    })
  }

  async updateClientContact() {}
}
