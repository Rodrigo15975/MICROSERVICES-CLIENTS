import { Prisma } from '@prisma/client'

export class CreateClientDto {
  userIdGoogle: string
  emailGoogle: string
  nameGoogle: string
}

export type CreateCouponForNewClient = Prisma.CouponCreateInput

export type CouponForNewClient = Prisma.ClientsGetPayload<{
  include: {
    coupon: true
  }
}>
