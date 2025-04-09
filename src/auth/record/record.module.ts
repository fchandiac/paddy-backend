import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '../../../libs/entities/record.entity'; // ✅ corrige la ruta si estás dentro de src/auth/record/

@Module({
    imports: [
        TypeOrmModule.forFeature([Record]), // ✅ este es el fix real
    ],
    controllers: [RecordController],
    providers: [RecordService],
    exports: [RecordService]
  
})
export class RecordModule {}
