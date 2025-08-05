import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true, })
    title: string;

    @Column('float', { default: 0 })
    price: number;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('text', { unique: true, })
    slug: string;

    @Column('int', { default: 0 })
    stock: number;

    @Column('text', { array: true })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags:string[];

    @BeforeInsert()
    checkSlugInsert() {
        //* Procedimiento almacenado: SI NO tenemos slug, será el título pero sustituyendo espacios por barrabajas y quitando las apóstrofes
        //* si SI lo tenemos, aun así intenta pasar a minúscula y cambiar espacios por barrabajas y quitar las apóstrofes
        if (!this.slug) this.slug = this.title
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }

    //* Después de modificar, SI SE HA ENVIADO SLUG en la update, se formatea.
    @BeforeUpdate()
    checkSlugUpdate() {
        if (this.slug) this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }
}
