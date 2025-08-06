import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductService');

  constructor(

    //* Muy parecido a las capas de Spring Boot con Java
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) { }

  //jos --------------------------------------- create ---------------------------------------
  async create(createProductDto: CreateProductDto) {

    try {

      //* Para autogenerar el slug si no se especifica, reemplazamos espacios " " por barrabajas "_" y quitamos las apóstrofes
      // if (!createProductDto.slug) createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ', '_').replaceAll("'", ''); //* Procedimiento almacenado en product.entity.ts

      //* El repository es de TypeORM, es decir, todos los métodos de productRepository son métodos de TypeORM
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails, // ...createProductDto,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save(product);

      return { ...product, images };

    } catch (error) {
      this.handelDBExceptions(error);
    }

    // return 'This action adds a new product';
  }

  //jos --------------------------------------- findAll ---------------------------------------
  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      }
    });

    return products.map(products => ({
      ...products,
      images: products.images!.map(image => image.url)
    }))
    // return `This action returns all products`;
  }

  //jos --------------------------------------- findOne ---------------------------------------
  async findOne(term: string) {

    let product: Product | null;

    if (isUUID(term)) product = await this.productRepository.findOneBy({ id: term });
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');


      //* Consulta para evaluar si lo recibido por parámetro encaja con el title o slug, el title ambos evaluados en mayúscula y el slug en minúscula
      product = await queryBuilder.where("UPPER(title) = :title or slug =:slug", {
        title: term.toLocaleUpperCase(),
        slug: term.toLocaleLowerCase(),
      })
        .leftJoinAndSelect('prod.images', 'prodImages') // Literalmente en la documentación dice que eager no es compatible con queryBuilder, por eso se añade leftJoinAndSelect
        .getOne();

      // product = await this.productRepository.findOneBy({ slug: term });
    }

    return product;

    //* Sólo con UUID:  
    // const product = await this.productRepository.findOneBy({ id: term });
    // if (!product) throw new NotFoundException("Producto no encontrado.");
    // return product;

    // return `This action returns a #${id} product`;
  }

  //jos --------------------------------------- findOnePlain ---------------------------------------
  async findOnePlain(term: string) {
    const product = await this.findOne(term);
    return { ...product, images: product!.images!.map(image => image.url) };
  }

  //jos --------------------------------------- update ---------------------------------------
  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;
    //* Habría que aclara el "rest" o "spread", 
    //* en productDetails es rest y en updateProductDto es spread.
    // const { images = [], ...productDetails } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate });

    if (!product) throw new NotFoundException("Producto no encontrado.");

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });

        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();

      //* Esto funciona bien, pero lo suyo es usar el @BeforeUpdate() de la entidad
      // if (updateProductDto.slug) product.slug = updateProductDto.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');

      // await this.productRepository.save(product); //* Usamos el manager.save()

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handelDBExceptions(error);
    }
    // return `This action updates a #${id} product`;
  }

  //jos --------------------------------------- remove ---------------------------------------
  async remove(id: string) {

    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException("Producto no encontrado.");
    await this.productRepository.delete({ id });
    return product;
    // return `This action removes a #${id} product`;
  }

    //jos --------------------------------------- remove ---------------------------------------
async deleteAllProduct(){
  const query = this.productRepository.createQueryBuilder('prod');

  try{
    return await query.delete().where({}).execute();
  } catch (error) {
    this.handelDBExceptions(error);
  }
}

  //jos --------------------------------------- handelDBExceptions ---------------------------------------
  private handelDBExceptions(error: any) {

    if (error.code === '23505') throw new InternalServerErrorException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error interno');
  }
}
