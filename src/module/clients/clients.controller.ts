// import { Controller } from '@nestjs/common'
// import { EventPattern, Payload } from '@nestjs/microservices'
// import { ClientsService } from './clients.service'
// // import { CreateClientDto } from './dto/create-client.dto'
// import { UpdateClientDto } from './dto/update-client.dto'

// @Controller()
// export class ClientsController {
//   constructor(private readonly clientsService: ClientsService) {}

//   create(data: any) {
//     console.log({
//       data,
//     })

//     // return this.clientsService.create(createClientDto)
//   }

//   @EventPattern('findAllClients')
//   findAll() {
//     return this.clientsService.findAll()
//   }

//   @EventPattern('findOneClient')
//   findOne(@Payload() id: number) {
//     return this.clientsService.findOne(id)
//   }

//   @EventPattern('updateClient')
//   update(@Payload() updateClientDto: UpdateClientDto) {
//     return this.clientsService.update(updateClientDto.id, updateClientDto)
//   }

//   @EventPattern('removeClient')
//   remove(@Payload() id: number) {
//     return this.clientsService.remove(id)
//   }
// }
