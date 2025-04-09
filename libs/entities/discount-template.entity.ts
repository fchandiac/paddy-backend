import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
  } from 'typeorm';
  
  @Entity()
  export class DiscountTemplate {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string; // Nombre de la plantilla (ej: "Plantilla estándar")
  
    @Column('float', { nullable: true })
    discount01: number;
  
    @Column('float', { nullable: true })
    discount02: number;
  
    @Column('float', { nullable: true })
    discount03: number;
  
    @Column('float', { nullable: true })
    discount04: number;
  
    @Column('float', { nullable: true })
    discount05: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @DeleteDateColumn()
    deletedAt: Date;
  }
  