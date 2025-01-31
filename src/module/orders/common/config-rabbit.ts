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

  ROUTING_EXCHANGE_GET_ALL_ORDERS: 'client.get.all.order',
  ROUTING_ROUTINGKEY_GET_ALL_ORDERS: 'client.get.all.order',
  ROUTING_QUEUE_GET_ALL_ORDERS: 'client.get.all.order',
}
export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    options: {
      durable: true,
      // expires: 60000,
      // messageTtl: 30000, // Los mensajes expiran si no son consumidos en el tiempo definido.
      // autoDelete: true, //Borra la cola cuando ya no hay consumidores activos.
    },
  },
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
    name: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    type: 'direct',
    options: {
      durable: true,
      // expires: 60000,
      // messageTtl: 30000, // Los mensajes expiran si no son consumidos en el tiempo definido.
      // autoDelete: true, //Borra la cola cuando ya no hay consumidores activos.
    },
  },
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
