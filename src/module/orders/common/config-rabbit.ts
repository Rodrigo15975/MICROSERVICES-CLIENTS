import {
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq'

export const configRabbit = {
  ROUTING_EXCHANGE_CREATE_ORDERS: 'order.create',
  ROUTING_ROUTINGKEY_CREATE_ORDERS: 'order.create',
  ROUTING_QUEUE_CREATE_ORDERS: 'order.create',

  ROUTING_EXCHANGE_SEND_DATA_ORDERS: 'client.send.data.orders',
  ROUTING_ROUTINGKEY_SEND_DATA_ORDERS: 'client.send.data.orders',
  ROUTING_QUEUE_SEND_DATA_ORDERS: 'client.send.data.orders',
}
export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: configRabbit.ROUTING_QUEUE_CREATE_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_CREATE_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_CREATE_ORDERS,
    options: {
      durable: true,
    },
  },
  {
    name: configRabbit.ROUTING_QUEUE_SEND_DATA_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_SEND_DATA_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_SEND_DATA_ORDERS,
    options: {
      durable: true,
    },
  },
]
export const configExchange: RabbitMQExchangeConfig[] = [
  {
    name: configRabbit.ROUTING_EXCHANGE_CREATE_ORDERS,
    type: 'direct',
    options: {
      durable: true,
    },
  },
  {
    name: configRabbit.ROUTING_EXCHANGE_SEND_DATA_ORDERS,
    type: 'direct',
    options: {
      durable: true,
    },
  },
]
