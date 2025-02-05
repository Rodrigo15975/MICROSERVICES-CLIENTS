import {
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq'

export const configRabbit = {
  ROUTING_EXCHANGE_CREATE_ORDERS: 'order.create',
  ROUTING_ROUTINGKEY_CREATE_ORDERS: 'order.create',
  ROUTING_QUEUE_CREATE_ORDERS: 'order.create',

  ROUTING_EXCHANGE_GET_ALL_ORDERS: 'client.get.all.orders',
  ROUTING_ROUTINGKEY_GET_ALL_ORDERS: 'client.get.all.orders',
  ROUTING_QUEUE_GET_ALL_ORDERS: 'client.get.all.orders',

  ROUTING_EXCHANGE_GET_ALL_ORDERS_CLIENT_ID: 'client.get.all.orders.client.id',
  ROUTING_ROUTINGKEY_GET_ALL_ORDERS_CLIENT_ID:
    'client.get.all.orders.client.id',
  ROUTING_QUEUE_GET_ALL_ORDERS_CLIENT_ID: 'client.get.all.orders.client.id',

  EXCHANGE_NAME_DECREMENTE_STOCK: 'decrement.stock',
  QUEUE_NAME_DECREMENTE_STOCK: 'decrement.stock',
  ROUTING_KEY_DECREMENTE_STOCK: 'decrement.tock',
}
export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS_CLIENT_ID,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS_CLIENT_ID,
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS_CLIENT_ID,
    options: {
      durable: true,
      // expires: 60000,
    },
  },
  {
    name: configRabbit.ROUTING_QUEUE_GET_ALL_ORDERS,
    routingKey: configRabbit.ROUTING_ROUTINGKEY_GET_ALL_ORDERS,
    exchange: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    options: {
      durable: true,
      // expires: 60000,
      messageTtl: 60000, // Los mensajes expiran si no son consumidos en el tiempo definido.
      // autoDelete: true, //Borra la cola cuando ya no hay consumidores activos.
    },
  },
  {
    name: configRabbit.QUEUE_NAME_DECREMENTE_STOCK,
    routingKey: configRabbit.ROUTING_KEY_DECREMENTE_STOCK,
    exchange: configRabbit.EXCHANGE_NAME_DECREMENTE_STOCK,
    options: {
      durable: true,
      // expires: 60000,
      // messageTtl: 60000, // Los mensajes expiran si no son consumidos en el tiempo definido.
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
]
export const configExchange: RabbitMQExchangeConfig[] = [
  {
    name: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS_CLIENT_ID,
    type: 'direct',
    options: {
      durable: true,
    },
  },
  {
    name: configRabbit.ROUTING_EXCHANGE_GET_ALL_ORDERS,
    type: 'direct',
    options: {
      durable: true,
      // expires: 60000,
      messageTtl: 60000, // Los mensajes expiran si no son consumidos en el tiempo definido.
      // autoDelete: true, //Borra la cola cuando ya no hay consumidores activos.
    },
  },
  {
    name: configRabbit.EXCHANGE_NAME_DECREMENTE_STOCK,
    type: 'direct',
    options: {
      durable: true,
      // expires: 60000,
      // messageTtl: 60000, // Los mensajes expiran si no son consumidos en el tiempo definido.
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
]
