import {
  RabbitMQExchangeConfig,
  RabbitMQQueueConfig,
} from '@golevelup/nestjs-rabbitmq'

export const configPublish = {
  QUEUE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_EXCHANGE_CREATE_COUPON: 'client.create.coupon',
  ROUTING_ROUTINGKEY_CREATE_COUPON: 'client.create.coupon',

  QUEUE_UPDATE_EXPIRY_DATE_COUPON: 'client.update.expiry.date.coupon',
  ROUTING_EXCHANGE_UPDATE_EXPIRY_DATE_COUPON:
    'client.update.expiry.date.coupon',
  ROUTING_ROUTINGKEY_UPDATE_EXPIRY_DATE_COUPON:
    'client.update.expiry.date.coupon',

  QUEUE_GET_ALL_CLIENTS: 'client.get.all.clients',
  ROUTING_EXCHANGE_GET_ALL_CLIENTS: 'client.get.all.clients',
  ROUTING_ROUTINGKEY_GET_ALL_CLIENTS: 'client.get.all.clients',

  ROUTING_EXCHANGE_GET_ONE_CLIENT: 'client.get.one.client',
  ROUTING_ROUTINGKEY_GET_ONE_CLIENT: 'client.get.one.client',
  QUEUE_GET_ONE_CLIENT: 'client.get.one.client',
}

export const configQueue: RabbitMQQueueConfig[] = [
  {
    name: 'client.create.coupon',
    routingKey: 'client.create.coupon',
    exchange: 'client.create.coupon',
    options: {
      persistent: true,
    },
  },

  {
    name: 'client.get.all.clients.only.coupons',
    routingKey: 'client.get.all.clients.only.coupons',
    exchange: 'client.get.all.clients.only.coupons',
    options: {
      persistent: true,
    },
  },

  {
    name: 'client.update.expiry.date.coupon',
    routingKey: 'client.update.expiry.date.coupon',
    exchange: 'client.update.expiry.date.coupon',
    options: {
      persistent: true,
    },
  },

  {
    name: 'client.get.all.clients',
    routingKey: 'client.get.all.clients',
    exchange: 'client.get.all.clients',
    options: {
      persistent: true,
    },
  },
  {
    name: 'client.get.one.client',
    routingKey: 'client.get.one.client',
    exchange: 'client.get.one.client',
    options: {
      persistent: true,
    },
  },
]

export const configExchange: RabbitMQExchangeConfig[] = [
  {
    name: 'client.create.coupon',
    type: 'direct',
    options: {
      persistent: true,
    },
  },

  {
    name: 'client.get.all.clients.only.coupons',
    type: 'direct',
    options: {
      persistent: true,
    },
  },
  {
    name: 'client.update.expiry.date.coupon',
    type: 'direct',
    options: {
      persistent: true,
    },
  },

  {
    name: 'client.get.all.clients',
    type: 'direct',
    options: {
      persistent: true,
    },
  },
  {
    name: 'client.get.one.client',
    type: 'direct',
    options: {
      persistent: true,
    },
  },
]
