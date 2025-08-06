import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { CreateProductDto } from 'src/products/dto/create-product.dto';

@Injectable()
export class SeedService {

  constructor(private readonly productsService: ProductsService) { }

  async runSeed() {
    console.log('Seeding...');

    if (!(await this.insertNewProducts())) return "Error inserting new products.";

    return "Seed executed.";
  }

  private async insertNewProducts() {
    this.productsService.deleteAllProduct();

    const products = initialData.products;

    // const insertPromises = []
    const insertPromises: Promise<any>[] = []; //* Any para que no sea Never

    products.forEach(product => {

      //* Mete las promesas en el array de promesas (pero no llega a crear e insertar como tal en la DB)
      insertPromises.push(this.productsService.create(product));

    })

    //* Resuelve finalmente las promesas y se inserta en DB
    await Promise.all(insertPromises);
    return true;
  }

  // create(createSeedDto: CreateSeedDto) {
  //   return 'This action adds a new seed';
  // }

  // findAll() {
  //   return `This action returns all seed`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} seed`;
  // }

  // update(id: number, updateSeedDto: UpdateSeedDto) {
  //   return `This action updates a #${id} seed`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} seed`;
  // }
}
