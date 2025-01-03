import {
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq'

export const configPublish = {
  QUEUE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_EXCHANGE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_ROUTINGKEY_CREATE_COUPON: 'client.create.coupon',
}

export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: 'client.create.coupon',
    routingKey: 'client.create.coupon',
    exchange: 'client.create.coupon',
  },
]

export const configExchange: RabbitMQExchangeConfig[] = [
  {
    name: 'client.create.coupon',
    type: 'direct',
  },
]
