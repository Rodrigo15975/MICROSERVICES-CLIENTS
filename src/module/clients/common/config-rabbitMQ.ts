import {
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq'

export const configPublish = {
  QUEUE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_EXCHANGE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_ROUTINGKEY_CREATE_COUPON: 'client.create.coupon',

  QUEUE_GET_ALL_CLIENTS_ONLY_COUPONS: 'client.get.all.clients.only.coupons',
  ROUTING_EXCHANGE_GET_ALL_CLIENTS_ONLY_COUPONS:
    'client.get.all.clients.only.coupons',
  ROUTING_ROUTINGKEY_GET_ALL_CLIENTS_ONLY_COUPONS:
    'client.get.all.clients.only.coupons',
}

export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: 'client.create.coupon',
    routingKey: 'client.create.coupon',
    exchange: 'client.create.coupon',
  },
  {
    name: 'client.get.all.clients.only.coupons',

    routingKey: 'client.get.all.clients.only.coupons',
    exchange: 'client.get.all.clients.only.coupons',
  },
]

export const configExchange: RabbitMQExchangeConfig[] = [
  {
    name: 'client.create.coupon',
    type: 'direct',
  },
  {
    name: 'client.get.all.clients.only.coupons',
    type: 'direct',
  },
]
