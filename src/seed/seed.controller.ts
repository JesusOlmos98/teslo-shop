import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  executeSeed(){
    return this.seedService.runSeed();
  }

  // @Post()
  // create(@Body() createSeedDto: CreateSeedDto) {
  //   return this.seedService.create(createSeedDto);
  // }

  // @Get()
  // findAll() {
  //   return this.seedService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.seedService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateSeedDto: UpdateSeedDto) {
  //   return this.seedService.update(+id, updateSeedDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.seedService.remove(+id);
  // }
}
