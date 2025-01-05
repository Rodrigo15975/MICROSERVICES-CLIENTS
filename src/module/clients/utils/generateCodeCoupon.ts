import { customAlphabet } from 'nanoid'

export const generateCouponCode = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const nanoid = customAlphabet(alphabet, 8) // 8 es la longitud del código
  const couponCode = nanoid()
  return couponCode
}
