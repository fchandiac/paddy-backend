import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User } from '../../libs/entities/user.entity';
import { DiscountPercent } from '../../libs/entities/discount-percent.entity';
import { RiceType } from '../../libs/entities/rice-type.entity'; // Added import
import { Producer } from '../../libs/entities/producer.entity'; // Added import
import { Template } from '../../libs/entities/template.entity'; // Added Template import


async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);
  const discountPercentRepository = dataSource.getRepository(DiscountPercent);
  const riceTypeRepository = dataSource.getRepository(RiceType);
  const producerRepository = dataSource.getRepository(Producer); // Added repository
  const templateRepository = dataSource.getRepository(Template); // Added Template repository

  console.log('Starting database seed...');

  // 1. Create Admin User
  const adminEmail = 'admin@ayg.cl';
  let adminUser = await userRepository.findOne({ where: { email: adminEmail } });

  if (!adminUser) {
    console.log(`Creating admin user: ${adminEmail}`)
    const saltRounds = 10;


    adminUser = userRepository.create({
      name: 'Administrador Principal',
      email: adminEmail,
      role: 'admin', // Or 'superadmin', 'administrator' as per your system
      pass: 'admin',
    });
    await userRepository.save(adminUser);
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }

  // 2. Seed DiscountPercent data
  console.log('Seeding DiscountPercent data...');

  const discountConfigurations = [
    {
      discountCode: 1, // Humedad
      name: "Humedad",
      ranges: [
        { start: 15.01, end: 15.5, percent: -1.0 },
        { start: 15.51, end: 16.0, percent: -1.5 },
        { start: 16.01, end: 16.5, percent: -2.0 },
        { start: 16.51, end: 17.0, percent: -2.5 },
        { start: 17.01, end: 17.5, percent: -3.0 },
        { start: 17.51, end: 18.0, percent: -4.03 },
        { start: 18.01, end: 18.5, percent: -4.62 },
        { start: 18.51, end: 19.0, percent: -5.21 },
        { start: 19.01, end: 19.5, percent: -5.79 },
        { start: 19.51, end: 20.0, percent: -6.38 },
        { start: 20.01, end: 20.5, percent: -6.97 },
        { start: 20.51, end: 21.0, percent: -7.56 },
        { start: 21.01, end: 21.5, percent: -8.15 },
        { start: 21.51, end: 22.0, percent: -8.74 },
        { start: 22.01, end: 22.5, percent: -9.32 },
        { start: 22.51, end: 23.0, percent: -9.91 },
        { start: 23.01, end: 23.5, percent: -10.5 },
        { start: 23.51, end: 24.0, percent: -11.09 },
        { start: 24.01, end: 24.5, percent: -11.68 },
        { start: 24.51, end: 25.0, percent: -12.26 },
        { start: 25.51, end: 100.0, percent: -100.0 },
      ],
    },
    {
      discountCode: 2, // Granos verdes
      name: "Granos Verdes",
      ranges: [
        { start: 0.0, end: 2.0, percent: 0.0 },
        { start: 2.01, end: 2.5, percent: -0.25 },
        { start: 2.51, end: 3.0, percent: -0.5 },
        { start: 3.01, end: 3.5, percent: -0.75 },
        { start: 3.51, end: 4.0, percent: -1.0 },
        { start: 4.01, end: 4.5, percent: -1.25 },
        { start: 4.51, end: 5.0, percent: -1.5 },
        { start: 5.01, end: 5.5, percent: -1.75 },
        { start: 5.51, end: 6.0, percent: -2.0 },
        { start: 6.01, end: 6.5, percent: -2.25 },
        { start: 6.51, end: 7.0, percent: -2.5 },
        { start: 7.01, end: 7.5, percent: -2.75 },
        { start: 7.51, end: 8.0, percent: -3.0 },
        { start: 8.01, end: 8.5, percent: -3.25 },
        { start: 8.51, end: 9.0, percent: -3.5 },
        { start: 9.01, end: 9.5, percent: -3.75 },
        { start: 9.51, end: 10.0, percent: -4.0 },
        { start: 10.01, end: 100.0, percent: -100.0 },
      ],
    },
    {
      discountCode: 3, // Impurezas
      name: "Impurezas",
      ranges: [
        { start: 0.0, end: 0.5, percent: 0.0 },
        { start: 0.51, end: 1.0, percent: 0.0 },
        { start: 1.01, end: 1.5, percent: 0.0 },
        { start: 1.51, end: 1.99, percent: 0.0 },
        { start: 2.0, end: 2.0, percent: 0.0 },
        { start: 2.01, end: 2.5, percent: -0.5 },
        { start: 2.51, end: 3.0, percent: -1.0 },
        { start: 3.01, end: 3.5, percent: -1.5 },
        { start: 3.51, end: 4.0, percent: -2.0 },
        { start: 4.01, end: 4.5, percent: -2.5 },
        { start: 4.51, end: 5.0, percent: -3.0 },
        { start: 5.01, end: 5.5, percent: -3.5 },
        { start: 5.51, end: 6.0, percent: -4.0 },
        { start: 6.01, end: 6.5, percent: -4.5 },
        { start: 6.51, end: 7.0, percent: -5.0 },
        { start: 7.01, end: 7.5, percent: -5.5 },
        { start: 7.51, end: 8.0, percent: -6.0 },
        { start: 8.01, end: 8.5, percent: -6.5 },
        { start: 8.51, end: 9.0, percent: -7.0 },
        { start: 9.01, end: 9.5, percent: -7.5 },
        { start: 9.51, end: 10.0, percent: -8.0 },
        { start: 10.0, end: 100.0, percent: -8.0 }, // Note: User data had 10.0, assumed it meant 10.01 or similar for start if it's exclusive of previous
      ],
    },
    {
      discountCode: 4, // Granos manchados y dañados
      name: "Granos manchados y dañados",
      ranges: [
        { start: 0.01, end: 0.5, percent: -0.5 },
        { start: 0.51, end: 1.0, percent: -1.0 },
        { start: 1.01, end: 1.5, percent: -1.5 },
        { start: 1.51, end: 2.0, percent: -2.0 },
        { start: 2.01, end: 2.5, percent: -2.5 },
        { start: 2.51, end: 3.0, percent: -3.0 },
        { start: 3.01, end: 3.05, percent: -3.0 },
      ],
    },
    {
      discountCode: 5, // Hualcacho
      name: "Hualcacho",
      ranges: [
        { start: 0.01, end: 0.5, percent: -0.75 },
        { start: 0.51, end: 1.0, percent: -1.5 },
        { start: 1.01, end: 1.5, percent: -2.25 },
        { start: 1.51, end: 2.0, percent: -3.0 },
        { start: 2.01, end: 2.5, percent: -3.75 },
        { start: 2.51, end: 3.0, percent: -4.5 },
        { start: 3.01, end: 3.5, percent: -5.25 },
        { start: 3.51, end: 4.0, percent: -6.0 },
        { start: 4.01, end: 4.5, percent: -6.75 },
        { start: 4.51, end: 5.0, percent: -7.5 },
      ],
    },
    {
      discountCode: 6, // Granos pelados y partidos
      name: "Granos pelados y partidos",
      ranges: [
        { start: 0.0, end: 1.0, percent: 0.0 },
        { start: 1.01, end: 2.0, percent: -1.0 },
        { start: 2.01, end: 3.0, percent: -2.0 },
        { start: 3.01, end: 4.0, percent: -3.0 },
        { start: 4.01, end: 5.0, percent: -4.0 },
        { start: 5.01, end: 6.0, percent: -5.0 },
        { start: 6.01, end: 7.0, percent: -6.0 },
        { start: 7.01, end: 8.0, percent: -7.0 },
        { start: 8.01, end: 9.0, percent: -8.0 },
        { start: 9.01, end: 10.0, percent: -9.0 },
        { start: 10.01, end: 100.0, percent: -100.0 },
      ],
    },
    {
      discountCode: 7, // Granos yesosos y yesados
      name: "Granos yesosos y yesados",
      ranges: [
        { start: 0.0, end: 1.0, percent: 0.0 },
        { start: 1.01, end: 1.5, percent: -0.5 },
        { start: 1.51, end: 2.0, percent: -1.0 },
        { start: 2.01, end: 2.5, percent: -1.5 },
        { start: 2.51, end: 3.0, percent: -2.0 },
        { start: 3.01, end: 3.5, percent: -2.5 },
        { start: 3.51, end: 4.0, percent: -3.0 },
        { start: 4.01, end: 4.5, percent: -3.5 },
        { start: 4.51, end: 5.0, percent: -4.0 },
        { start: 5.01, end: 100.0, percent: -100.0 },
      ],
    },
    // Note: "Vano" (id: 9) is skipped as no range data was provided.
    // Note: "secado" data is skipped as its discountCode is unclear.
    // If "secado" needs to be seeded, please provide its discountCode.
    // Example for "secado" if it had discountCode: 8
    // {
    //   discountCode: 8, // Assuming a code for Secado
    //   name: "Secado",
    //   ranges: [
    //     { start: 15.01, end: 17.0, percent: 1.5 },
    //     { start: 17.01, end: 20.0, percent: 2.5 },
    //     { start: 20.01, end: 22.5, percent: 3.5 },
    //     { start: 22.51, end: 100.0, percent: 4.5 },
    //   ],
    // },
  ];

  for (const config of discountConfigurations) {
    console.log(`Processing discount code: ${config.discountCode} (${config.name})`);
    // Clear existing entries for this discountCode to prevent duplicates
    await discountPercentRepository.delete({ discountCode: config.discountCode });

    for (const range of config.ranges) {
      const discountPercentEntry = discountPercentRepository.create({
        discountCode: config.discountCode,
        start: range.start,
        end: range.end,
        percent: Math.abs(range.percent), // Ensure percent is positive
      });
      await discountPercentRepository.save(discountPercentEntry);
    }
    console.log(`Finished seeding for discount code: ${config.discountCode}`);
  }
  console.log('DiscountPercent data seeding finished.');

  // 3. Seed RiceType data
  console.log('Seeding RiceType data...');
  const riceTypesData = [
    { code: 101, name: 'Diamante', description: 'Arroz Premium Diamante - Grano largo y fino' },
    { code: 102, name: 'Zafiro', description: 'Arroz Zafiro - Calidad superior, grano mediano' },
    { code: 103, name: 'Pantera', description: 'Arroz Pantera - Variedad resistente, alto rendimiento' },
    { code: 104, name: 'Cuarzo', description: 'Arroz Cuarzo - Grano cristalino, excelente cocción' },
    { code: 105, name: 'Quella', description: 'Arroz Quella - Variedad tradicional, sabor característico' },
    { code: 106, name: 'Ámbar', description: 'Arroz Ámbar - Grano dorado, textura suave' },
  ];

  for (const riceData of riceTypesData) {
    // Check by code first, then by name to avoid duplicates
    let riceType = await riceTypeRepository.findOne({ 
      where: [
        { code: riceData.code },
        { name: riceData.name }
      ]
    });
    
    if (!riceType) {
      // Generate a random price between 450 and 750, with the last digit being 0
      const randomPrice = Math.floor(Math.random() * (75 - 45 + 1) + 45) * 10;
      riceType = riceTypeRepository.create({
        code: riceData.code,
        name: riceData.name,
        price: randomPrice,
        enable: true,
        description: riceData.description,
      });
      await riceTypeRepository.save(riceType);
      console.log(`Created RiceType: ${riceData.name} (Code: ${riceData.code}) with price ${randomPrice}`);
    } else {
      console.log(`RiceType ${riceData.name} (Code: ${riceData.code}) already exists.`);
    }
  }
  console.log('RiceType data seeding finished.');

  // 4. Seed Producer data
  console.log('Seeding Producer data...');
  
  const producersData = [
    {
      name: 'Productor de Ejemplo Seed',
      businessName: 'Ejemplo Producciones SpA',
      rut: '77.123.456-K',
      address: 'Parcela 123, Camino Rural, Chile',
      phone: '+56912345678',
      bank: 'Banco Estado'
    },
    {
      name: 'María Elena González',
      businessName: 'Agrícola González Ltda.',
      rut: '12.345.678-9',
      address: 'Fundo El Roble, Km 15, Rancagua',
      phone: '+56987654321',
      bank: 'Banco de Chile'
    },
    {
      name: 'Carlos Muñoz Pérez',
      businessName: 'Cultivos del Sur SpA',
      rut: '98.765.432-1',
      address: 'Parcela 45, Sector Los Aromos, Talca',
      phone: '+56934567890',
      bank: 'Banco Santander'
    },
    {
      name: 'Ana María Silva',
      businessName: 'Hacienda Santa Rosa',
      rut: '23.456.789-0',
      address: 'Camino a Linares Km 8, Parral',
      phone: '+56945678901',
      bank: 'Banco BCI'
    },
    {
      name: 'Roberto Contreras',
      businessName: 'Agropecuaria Contreras E.I.R.L.',
      rut: '87.654.321-2',
      address: 'Fundo Los Maitenes, Curicó',
      phone: '+56956789012',
      bank: 'Banco Estado'
    },
    {
      name: 'Patricia Ramírez',
      businessName: 'Cereales del Valle SpA',
      rut: '34.567.890-1',
      address: 'Parcela 78, San Javier',
      phone: '+56967890123',
      bank: 'Banco Falabella'
    },
    {
      name: 'Luis Alberto Torres',
      businessName: 'Campos Verdes Ltda.',
      rut: '76.543.210-3',
      address: 'Sector El Trapiche, Molina',
      phone: '+56978901234',
      bank: 'Banco de Chile'
    },
    {
      name: 'Carmen Espinoza',
      businessName: 'Agro Espinoza y Asociados',
      rut: '45.678.901-2',
      address: 'Fundo La Esperanza, Constitución',
      phone: '+56989012345',
      bank: 'Banco Santander'
    },
    {
      name: 'Francisco Herrera',
      businessName: 'Semillas del Maule SpA',
      rut: '65.432.109-4',
      address: 'Camino Rural Km 12, Villa Alegre',
      phone: '+56990123456',
      bank: 'Banco BCI'
    },
    {
      name: 'Mónica Vargas',
      businessName: 'Granja Vargas Hermanos',
      rut: '54.321.098-5',
      address: 'Parcela 156, Sector Norte, Cauquenes',
      phone: '+56901234567',
      bank: 'Banco Estado'
    },
    {
      name: 'Andrés Morales',
      businessName: 'Cultivos Sustentables SpA',
      rut: '21.098.765-6',
      address: 'Fundo El Quillay, San Carlos',
      phone: '+56912345670',
      bank: 'Banco Falabella'
    },
    {
      name: 'Jorge Alejandro Soto',
      businessName: 'Jorge Alejandro Soto',
      rut: '19.876.543-7',
      address: 'Parcela 89, Sector El Manzano, Linares',
      phone: '+56923456781',
      bank: 'Banco Estado'
    },
    {
      name: 'Isabel Francisca Rojas',
      businessName: 'Isabel Francisca Rojas',
      rut: '16.543.210-8',
      address: 'Camino Los Nogales Km 5, Chillán',
      phone: '+56934567892',
      bank: 'Banco de Chile'
    },
    {
      name: 'Manuel Antonio Vega',
      businessName: 'Manuel Antonio Vega',
      rut: '14.321.098-9',
      address: 'Fundo San Pedro, Los Ángeles',
      phone: '+56945678903',
      bank: 'Banco Santander'
    },
    {
      name: 'Rosa Elena Mendoza',
      businessName: 'Rosa Elena Mendoza',
      rut: '13.210.987-0',
      address: 'Parcela 234, Sector Oriente, Temuco',
      phone: '+56956789014',
      bank: 'Banco BCI'
    },
    {
      name: 'Pedro Pablo Castillo',
      businessName: 'Pedro Pablo Castillo',
      rut: '11.098.765-1',
      address: 'Camino Rural Sur Km 18, Angol',
      phone: '+56967890125',
      bank: 'Banco Falabella'
    }
  ];

  for (const producerData of producersData) {
    let producer = await producerRepository.findOne({ where: { rut: producerData.rut } });
    
    if (!producer) {
      producer = producerRepository.create({
        name: producerData.name,
        businessName: producerData.businessName,
        rut: producerData.rut,
        address: producerData.address,
        phone: producerData.phone,
        bankAccounts: [
          {
            bankCode: 103, // ejemplo: BCI
            bankName: producerData.bank,
            accountNumber: (Math.floor(Math.random() * 9000000000) + 1000000000).toString(),
            accountTypeCode: 101, // ejemplo: Cuenta Corriente
            accountTypeName: Math.random() > 0.5 ? 'Cuenta Corriente' : 'Cuenta Vista',
            holderName: producerData.businessName,
          },
        ],
      });
      await producerRepository.save(producer);
      console.log(`Created Producer: ${producer.name} with RUT ${producer.rut}`);
    } else {
      console.log(`Producer with RUT ${producerData.rut} already exists.`);
    }
  }
  console.log('Producer data seeding finished.');

  // 5. Seed Template data - Plantilla básica con valores en cero
  console.log('Seeding basic Template data...');
  const basicTemplateName = 'Plantilla Básica';
  let basicTemplate = await templateRepository.findOne({ where: { name: basicTemplateName } });

  if (!basicTemplate) {
    basicTemplate = templateRepository.create({
      name: basicTemplateName,
      // Configuración sin grupos de tolerancia
      useToleranceGroup: false,
      groupToleranceValue: 0,
      
      // Valores en cero para todos los parámetros
      // Humedad
      availableHumedad: true,
      percentHumedad: 0,
      toleranceHumedad: 0,
      showToleranceHumedad: false,
      groupToleranceHumedad: false,
      
      // Granos Verdes
      availableGranosVerdes: true,
      percentGranosVerdes: 0,
      toleranceGranosVerdes: 0,
      showToleranceGranosVerdes: false,
      groupToleranceGranosVerdes: false,
      
      // Impurezas
      availableImpurezas: true,
      percentImpurezas: 0,
      toleranceImpurezas: 0,
      showToleranceImpurezas: false,
      groupToleranceImpurezas: false,
      
      // Granos Manchados
      availableGranosManchados: true,
      percentGranosManchados: 0,
      toleranceGranosManchados: 0,
      showToleranceGranosManchados: false,
      groupToleranceGranosManchados: false,
      
      // Hualcacho
      availableHualcacho: true,
      percentHualcacho: 0,
      toleranceHualcacho: 0,
      showToleranceHualcacho: false,
      groupToleranceHualcacho: false,
      
      // Granos Pelados
      availableGranosPelados: true,
      percentGranosPelados: 0,
      toleranceGranosPelados: 0,
      showToleranceGranosPelados: false,
      groupToleranceGranosPelados: false,
      
      // Granos Yesosos
      availableGranosYesosos: true,
      percentGranosYesosos: 0,
      toleranceGranosYesosos: 0,
      showToleranceGranosYesosos: false,
      groupToleranceGranosYesosos: false,
      
      // Vano
      availableVano: true,
      percentVano: 0,
      toleranceVano: 0,
      showToleranceVano: false,
      groupToleranceVano: false,
      
      // Bonificación
      availableBonus: true,
      toleranceBonus: 0,
      
      // Secado
      availableDry: true,
      percentDry: 0,
      
      // Marcar como plantilla por defecto
      default: true
    });
    
    await templateRepository.save(basicTemplate);
    console.log(`Created basic Template: ${basicTemplate.name}`);
  } else {
    console.log(`Template with name '${basicTemplateName}' already exists.`);
  }
  console.log('Template data seeding finished.');

  // 6. Seed Additional Templates - 20 plantillas con diferentes combinaciones
  console.log('Seeding additional Template variations...');
  
  const templateVariations = [
    {
      name: 'Plantilla Premium',
      useToleranceGroup: true,
      groupToleranceValue: 2.5,
      percentHumedad: 15.0,
      toleranceHumedad: 0.5,
      percentGranosVerdes: 2.0,
      toleranceGranosVerdes: 0.3,
      percentImpurezas: 1.0,
      toleranceImpurezas: 0.2,
    },
    {
      name: 'Plantilla Estricta',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 14.0,
      toleranceHumedad: 0.2,
      percentGranosVerdes: 1.5,
      toleranceGranosVerdes: 0.1,
      percentImpurezas: 0.5,
      toleranceImpurezas: 0.1,
    },
    {
      name: 'Plantilla Tolerante',
      useToleranceGroup: true,
      groupToleranceValue: 5.0,
      percentHumedad: 16.0,
      toleranceHumedad: 1.0,
      percentGranosVerdes: 3.0,
      toleranceGranosVerdes: 0.8,
      percentImpurezas: 2.0,
      toleranceImpurezas: 0.5,
    },
    {
      name: 'Plantilla Comercial A',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 15.5,
      toleranceHumedad: 0.7,
      percentGranosVerdes: 2.5,
      toleranceGranosVerdes: 0.4,
      percentImpurezas: 1.5,
      toleranceImpurezas: 0.3,
    },
    {
      name: 'Plantilla Comercial B',
      useToleranceGroup: true,
      groupToleranceValue: 3.0,
      percentHumedad: 14.5,
      toleranceHumedad: 0.4,
      percentGranosVerdes: 2.2,
      toleranceGranosVerdes: 0.3,
      percentImpurezas: 1.2,
      toleranceImpurezas: 0.25,
    },
    {
      name: 'Plantilla Export',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 13.5,
      toleranceHumedad: 0.3,
      percentGranosVerdes: 1.0,
      toleranceGranosVerdes: 0.15,
      percentImpurezas: 0.8,
      toleranceImpurezas: 0.1,
    },
    {
      name: 'Plantilla Estándar Plus',
      useToleranceGroup: true,
      groupToleranceValue: 4.0,
      percentHumedad: 15.2,
      toleranceHumedad: 0.6,
      percentGranosVerdes: 2.8,
      toleranceGranosVerdes: 0.5,
      percentImpurezas: 1.8,
      toleranceImpurezas: 0.4,
    },
    {
      name: 'Plantilla Regional Norte',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 16.5,
      toleranceHumedad: 0.8,
      percentGranosVerdes: 3.2,
      toleranceGranosVerdes: 0.6,
      percentImpurezas: 2.2,
      toleranceImpurezas: 0.45,
    },
    {
      name: 'Plantilla Regional Sur',
      useToleranceGroup: true,
      groupToleranceValue: 3.5,
      percentHumedad: 14.8,
      toleranceHumedad: 0.5,
      percentGranosVerdes: 2.0,
      toleranceGranosVerdes: 0.35,
      percentImpurezas: 1.3,
      toleranceImpurezas: 0.3,
    },
    {
      name: 'Plantilla Orgánica',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 13.0,
      toleranceHumedad: 0.25,
      percentGranosVerdes: 0.8,
      toleranceGranosVerdes: 0.1,
      percentImpurezas: 0.3,
      toleranceImpurezas: 0.05,
    },
    {
      name: 'Plantilla Industrial',
      useToleranceGroup: true,
      groupToleranceValue: 6.0,
      percentHumedad: 18.0,
      toleranceHumedad: 1.5,
      percentGranosVerdes: 4.0,
      toleranceGranosVerdes: 1.0,
      percentImpurezas: 3.0,
      toleranceImpurezas: 0.8,
    },
    {
      name: 'Plantilla Temporal Verano',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 12.5,
      toleranceHumedad: 0.3,
      percentGranosVerdes: 1.8,
      toleranceGranosVerdes: 0.25,
      percentImpurezas: 1.0,
      toleranceImpurezas: 0.2,
    },
    {
      name: 'Plantilla Temporal Invierno',
      useToleranceGroup: true,
      groupToleranceValue: 4.5,
      percentHumedad: 17.0,
      toleranceHumedad: 1.0,
      percentGranosVerdes: 3.5,
      toleranceGranosVerdes: 0.7,
      percentImpurezas: 2.5,
      toleranceImpurezas: 0.6,
    },
    {
      name: 'Plantilla Especial Diamante',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 13.8,
      toleranceHumedad: 0.35,
      percentGranosVerdes: 1.2,
      toleranceGranosVerdes: 0.18,
      percentImpurezas: 0.6,
      toleranceImpurezas: 0.12,
    },
    {
      name: 'Plantilla Especial Zafiro',
      useToleranceGroup: true,
      groupToleranceValue: 2.8,
      percentHumedad: 14.2,
      toleranceHumedad: 0.4,
      percentGranosVerdes: 1.6,
      toleranceGranosVerdes: 0.22,
      percentImpurezas: 0.9,
      toleranceImpurezas: 0.15,
    },
    {
      name: 'Plantilla Cooperativa A',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 15.8,
      toleranceHumedad: 0.65,
      percentGranosVerdes: 2.6,
      toleranceGranosVerdes: 0.45,
      percentImpurezas: 1.6,
      toleranceImpurezas: 0.35,
    },
    {
      name: 'Plantilla Cooperativa B',
      useToleranceGroup: true,
      groupToleranceValue: 3.8,
      percentHumedad: 16.2,
      toleranceHumedad: 0.75,
      percentGranosVerdes: 2.9,
      toleranceGranosVerdes: 0.55,
      percentImpurezas: 1.9,
      toleranceImpurezas: 0.42,
    },
    {
      name: 'Plantilla Flexible',
      useToleranceGroup: true,
      groupToleranceValue: 5.5,
      percentHumedad: 17.5,
      toleranceHumedad: 1.2,
      percentGranosVerdes: 3.8,
      toleranceGranosVerdes: 0.9,
      percentImpurezas: 2.8,
      toleranceImpurezas: 0.7,
    },
    {
      name: 'Plantilla Conservadora',
      useToleranceGroup: false,
      groupToleranceValue: 0,
      percentHumedad: 13.2,
      toleranceHumedad: 0.28,
      percentGranosVerdes: 1.1,
      toleranceGranosVerdes: 0.12,
      percentImpurezas: 0.7,
      toleranceImpurezas: 0.08,
    },
    {
      name: 'Plantilla Mixta',
      useToleranceGroup: true,
      groupToleranceValue: 3.2,
      percentHumedad: 15.0,
      toleranceHumedad: 0.55,
      percentGranosVerdes: 2.3,
      toleranceGranosVerdes: 0.38,
      percentImpurezas: 1.4,
      toleranceImpurezas: 0.28,
    }
  ];

  for (const templateData of templateVariations) {
    let template = await templateRepository.findOne({ where: { name: templateData.name } });
    
    if (!template) {
      template = templateRepository.create({
        name: templateData.name,
        useToleranceGroup: templateData.useToleranceGroup,
        groupToleranceValue: templateData.groupToleranceValue,
        
        // Humedad
        availableHumedad: true,
        percentHumedad: templateData.percentHumedad,
        toleranceHumedad: templateData.toleranceHumedad,
        showToleranceHumedad: Math.random() > 0.5,
        groupToleranceHumedad: templateData.useToleranceGroup && Math.random() > 0.3,
        
        // Granos Verdes
        availableGranosVerdes: true,
        percentGranosVerdes: templateData.percentGranosVerdes,
        toleranceGranosVerdes: templateData.toleranceGranosVerdes,
        showToleranceGranosVerdes: Math.random() > 0.5,
        groupToleranceGranosVerdes: templateData.useToleranceGroup && Math.random() > 0.3,
        
        // Impurezas
        availableImpurezas: true,
        percentImpurezas: templateData.percentImpurezas,
        toleranceImpurezas: templateData.toleranceImpurezas,
        showToleranceImpurezas: Math.random() > 0.5,
        groupToleranceImpurezas: templateData.useToleranceGroup && Math.random() > 0.3,
        
        // Granos Manchados (valores aleatorios basados en los principales)
        availableGranosManchados: Math.random() > 0.2,
        percentGranosManchados: Math.round((templateData.percentGranosVerdes * 0.8) * 100) / 100,
        toleranceGranosManchados: Math.round((templateData.toleranceGranosVerdes * 0.8) * 100) / 100,
        showToleranceGranosManchados: Math.random() > 0.5,
        groupToleranceGranosManchados: templateData.useToleranceGroup && Math.random() > 0.4,
        
        // Hualcacho
        availableHualcacho: Math.random() > 0.3,
        percentHualcacho: Math.round((templateData.percentImpurezas * 0.6) * 100) / 100,
        toleranceHualcacho: Math.round((templateData.toleranceImpurezas * 0.6) * 100) / 100,
        showToleranceHualcacho: Math.random() > 0.5,
        groupToleranceHualcacho: templateData.useToleranceGroup && Math.random() > 0.4,
        
        // Granos Pelados
        availableGranosPelados: Math.random() > 0.25,
        percentGranosPelados: Math.round((templateData.percentGranosVerdes * 1.2) * 100) / 100,
        toleranceGranosPelados: Math.round((templateData.toleranceGranosVerdes * 1.2) * 100) / 100,
        showToleranceGranosPelados: Math.random() > 0.5,
        groupToleranceGranosPelados: templateData.useToleranceGroup && Math.random() > 0.4,
        
        // Granos Yesosos
        availableGranosYesosos: Math.random() > 0.3,
        percentGranosYesosos: Math.round((templateData.percentGranosVerdes * 0.9) * 100) / 100,
        toleranceGranosYesosos: Math.round((templateData.toleranceGranosVerdes * 0.9) * 100) / 100,
        showToleranceGranosYesosos: Math.random() > 0.5,
        groupToleranceGranosYesosos: templateData.useToleranceGroup && Math.random() > 0.4,
        
        // Vano
        availableVano: Math.random() > 0.4,
        percentVano: Math.round((templateData.percentImpurezas * 1.5) * 100) / 100,
        toleranceVano: Math.round((templateData.toleranceImpurezas * 1.5) * 100) / 100,
        showToleranceVano: Math.random() > 0.5,
        groupToleranceVano: templateData.useToleranceGroup && Math.random() > 0.4,
        
        // Bonificación
        availableBonus: Math.random() > 0.3,
        toleranceBonus: Math.round((templateData.toleranceHumedad * 2) * 100) / 100,
        
        // Secado
        availableDry: Math.random() > 0.2,
        percentDry: Math.round((templateData.percentHumedad * 0.7) * 100) / 100,
        
        // No es plantilla por defecto
        default: false
      });
      
      await templateRepository.save(template);
      console.log(`Created Template: ${template.name}`);
    } else {
      console.log(`Template with name '${templateData.name}' already exists.`);
    }
  }
  console.log('Additional template variations seeding finished.');

  console.log('Database seed process finished.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error during database seed script:', err);
  process.exit(1);
});
