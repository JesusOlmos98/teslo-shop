import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {




  getStaticProductImage(imageName: string) {

    const path = join(__dirname, '../../static/products/', imageName);

    if (!existsSync(path)) throw new BadRequestException("Image not found.");

    return path;

  }











  // create(createFileDto: CreateFileDto) {
  //   return 'This action adds a new file';
  // }

  // findAll() {
  //   return `This action returns all files`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} file`;
  // }

  // update(id: number, updateFileDto: UpdateFileDto) {
  //   return `This action updates a #${id} file`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} file`;
  // }
}
