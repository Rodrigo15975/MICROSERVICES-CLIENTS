import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import Bottleneck from 'bottleneck'
import { PrismaService } from 'src/prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import {
  CACHE_NAME_FIND_ONE_CLIENT,
  CACHE_NAME_ONLY_COUPONS,
} from './common/cache-name'
import { configPublish } from './common/config-rabbitMQ'
import { HandledRpcException } from './common/handle-errorst'
import {
  CouponForNewClient,
  CreateCouponForNewClient,
} from './dto/create-client.dto'
import { convertedDateISO } from './utils/formatDateIso'
import { generateCouponCode } from './utils/generateCodeCoupon'
import { expiredDateVerification } from './utils/verificationDate'
import { NotificationEmailService } from '../notification-email/notification-email.service'
@Injectable()
export class ClientsService {
  private readonly logger: Logger = new Logger(ClientsService.name)
  private readonly limiter = new Bottleneck({
    maxConcurrent: 5, // Máximo 3 tareas concurrentes
    minTime: 100, // Al menos 200 ms entre tareas
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

  async create() {}

  @RabbitRPC({
    queue: configPublish.QUEUE_CREATE_COUPON,
    routingKey: configPublish.ROUTING_ROUTINGKEY_CREATE_COUPON,
    exchange: configPublish.ROUTING_EXCHANGE_CREATE_COUPON,
  })
  async createCuponIfUserNotExists(userIdGoogle: string) {
    return await this.createClient(userIdGoogle)
  }
  private async createClient(userIdGoogle: string) {
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
          userIdGoogle,
        },
      })
      this.logger.verbose('Client created successfully')
      return await this.createCouponForNewClient(userIdGoogle)
    } catch (error) {
      this.logger.error(error)
      throw HandledRpcException.rpcException(
        error.message || 'Internal Server Error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        ClientsService.name,
      )
    }
  }

  private async createCouponForNewClient(userIdGoogle: string) {
    try {
      const data = this.getDataForCreateCoupon(userIdGoogle)
      await this.prismaService.coupon.create({
        data,
      })
      await this.cacheService.delete(CACHE_NAME_ONLY_COUPONS)
      await this.findAllCupons()
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
      this.logger.error(error)
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

  private getDataForCreateCoupon(userIdGoogle: string) {
    const code = generateCouponCode()
    const { endDate: espiryDate, startDate } = convertedDateISO()
    const data: CreateCouponForNewClient = {
      code,
      discount: 20,
      expired: false,
      startDate,
      espiryDate,
      clients: {
        connect: {
          userIdGoogle,
        },
      },
    }
    return data
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

  async findOne(userIdGoogle: string) {
    try {
      const clientCaching = await this.cacheService.get(
        CACHE_NAME_FIND_ONE_CLIENT,
      )
      if (clientCaching) return clientCaching
      const client = await this.prismaService.clients.findUnique({
        where: {
          userIdGoogle,
        },
        include: {
          coupon: true,
          orders: true,
          contact: true,
        },
      })
      await this.cacheService.set(CACHE_NAME_FIND_ONE_CLIENT, client, '1h')
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
  // update contact of client
  async updateClientContact() {}

  /**
   * testing
   */
  @RabbitSubscribe({
    routingKey: 'testing',
    exchange: 'testing',
    queue: 'testing',
  })
  public async testing() {
    await this.notificationEmail.sendEmail()
  }
}
