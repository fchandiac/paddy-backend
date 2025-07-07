import { Module } from '@nestjs/common';
import { ReceptionController } from './receptions.controller';
import { ReceptionService } from './receptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reception } from '../../../libs/entities/reception.entity'; 
import { Producer } from '../../../libs/entities/producer.entity';
import { RiceType } from '../../../libs/entities/rice-type.entity'; // ✅ corrige la ruta si estás dentro de src/receptions/reception/
import { Template } from '../../../libs/entities/template.entity'; // ✅ corrige la ruta si estás dentro de src/receptions/reception/
import { User } from '../../../libs/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reception, Producer, RiceType, Template, User]), // ✅ agregamos User
  ],
  controllers: [ReceptionController],
  providers: [ReceptionService],
  exports: [ReceptionService],
})
export class ReceptionsModule {}
