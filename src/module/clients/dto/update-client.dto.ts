import { PartialType } from '@nestjs/mapped-types'
import { CreateClientDto, CreateCouponForNewClient } from './create-client.dto'

export class UpdateClientDto extends PartialType(CreateClientDto) {
  id: number
}

export type UpdateCouponForNewClient = Partial<CreateCouponForNewClient>
