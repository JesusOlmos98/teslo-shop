import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) { }


  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string) {

    const path = this.filesService.getStaticProductImage(imageName);

    // return path;

    // res.status(403).json({
    //   ok: false,
    //   path: path
    // })

    res.sendFile(path);
  }



  @Post('product')
  @UseInterceptors(FileInterceptor('File',
    {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000000 }
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileNamer
      })
    }
  ))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File) {

    if (!file) throw new BadRequestException('File is empty or not valid.');
    // return file;
    console.log(file);

    // const secureUrl = `${file.filename}`;
    const secureUrl = `${this.configService.get('HOST_API')}http://localhost:3000/api/files/product/${file.filename}`;

    return { secureUrl };
  }

  // @Post()
  // create(@Body() createFileDto: CreateFileDto) {
  //   return this.filesService.create(createFileDto);
  // }

  // @Get()
  // findAll() {
  //   return this.filesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.filesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
  //   return this.filesService.update(+id, updateFileDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.filesService.remove(+id);
  // }
}
