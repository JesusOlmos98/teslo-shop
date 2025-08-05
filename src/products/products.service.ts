import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(

    //* Muy parecido a las capas de Spring Boot con Java
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

  ) { }

  // --------------------------------------- create ---------------------------------------
  async create(createProductDto: CreateProductDto) {

    try {

      //* Para autogenerar el slug si no se especifica, reemplazamos espacios " " por barrabajas "_" y quitamos las apóstrofes
      // if (!createProductDto.slug) createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ', '_').replaceAll("'", ''); //* Procedimiento almacenado en product.entity.ts

      //* El repository es de TypeORM, es decir, todos los métodos de productRepository son métodos de TypeORM
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.handelDBExceptions(error);
    }

    // return 'This action adds a new product';
  }

  // --------------------------------------- findAll ---------------------------------------
  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    return this.productRepository.find({
      take: limit,
      skip: offset,
    });
    // return `This action returns all products`;
  }

  // --------------------------------------- findOne ---------------------------------------
  async findOne(term: string) {

    let product: Product | null;

    if (isUUID(term)) product = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder();


      //* Consulta para evaluar si lo recibido por parámetro encaja con el title o slug, el title ambos evaluados en mayúscula y el slug en minúscula
      product = await queryBuilder.where("UPPER(title) = :title or slug =:slug", {
        title: term.toLocaleUpperCase(),
        slug: term.toLocaleLowerCase(),
      }).getOne();

      // product = await this.productRepository.findOneBy({ slug: term });
    }

    return product;

    //* Sólo con UUID:  
    // const product = await this.productRepository.findOneBy({ id: term });
    // if (!product) throw new NotFoundException("Producto no encontrado.");
    // return product;

    // return `This action returns a #${id} product`;
  }

  // --------------------------------------- update ---------------------------------------
  async update(id: string, updateProductDto: UpdateProductDto) {

    try {
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto
      });

      if (!product) throw new NotFoundException("Producto no encontrado.");

      //* Esto funciona bien, pero lo suyo es usar el @BeforeUpdate() de la entidad
      // if (updateProductDto.slug) product.slug = updateProductDto.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handelDBExceptions(error);
    }
    // return `This action updates a #${id} product`;
  }

  // --------------------------------------- remove ---------------------------------------
  async remove(id: string) {

    // return this.productRepository.delete(id);
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException("Producto no encontrado.");
    await this.productRepository.delete({ id });
    return product;
    // return `This action removes a #${id} product`;
  }

  // --------------------------------------- handelDBExceptions ---------------------------------------
  private handelDBExceptions(error: any) {

    if (error.code === '23505') throw new InternalServerErrorException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error interno');
  }
}
