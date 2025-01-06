import { Prisma } from '@prisma/client'

export class CreateClientDto {}

export type CreateCouponForNewClient = Prisma.CouponCreateInput

export type CouponForNewClient = Prisma.ClientsGetPayload<{
  include: {
    coupon: true
  }
}>
