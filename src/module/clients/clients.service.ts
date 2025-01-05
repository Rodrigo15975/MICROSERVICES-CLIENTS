import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { HttpStatus, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { configPublish } from './common/config-rabbitMQ'
import { CreateCouponForNewClient } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { convertedDateISO } from './utils/formatDateIso'
import { generateCouponCode } from './utils/generateCodeCoupon'
import { HandledRpcException } from './common/handle-errorst'

@Injectable()
export class ClientsService {
  private readonly logger: Logger = new Logger(ClientsService.name)
  constructor(private readonly prismaService: PrismaService) {}

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
  @RabbitRPC({
    queue: configPublish.QUEUE_GET_ALL_CLIENTS_ONLY_COUPONS,
    routingKey: configPublish.ROUTING_ROUTINGKEY_GET_ALL_CLIENTS_ONLY_COUPONS,
    exchange: configPublish.ROUTING_EXCHANGE_GET_ALL_CLIENTS_ONLY_COUPONS,
  })
  async findAllCupons() {
    try {
      return await this.prismaService.clients.findMany({
        include: {
          coupon: {
            select: {
              startDate: true,
              espiryDate: true,
              id: true,
              code: true,
            },
          },
        },
      })
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
    try {
      return await this.prismaService.clients.findMany({
        include: {
          _count: true,
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
      discount: 10,
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
  private updateEspiryDateCouponForNewClient() {}

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
