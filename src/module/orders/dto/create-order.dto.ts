export class CreateOrderDto {
  amount_total: string
  productIds: string
  orderId: string
  userId: string
  statusPayment: 'paid'
}

export class Orders {
  totalPrice: number
  dataFormat: {
    product: string
    brand: string
    quantity_buy: number
    category: {
      id: number
      category: string
    }
    discount: number
    price: number
    gender: string
    productVariant: {
      color: string
      id: number
      key_url: string
      url: string
    }[]
    size: string[]
    id: number
  }[]
  emailUser: string
  idUser: string
}
