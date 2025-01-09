import { CreateCouponForNewClient } from '../dto/create-client.dto'
import { convertedDateISO } from './formatDateIso'
import { generateCouponCode } from './generateCodeCoupon'

export const getDataForCreateCoupon = (userIdGoogle: string) => {
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
