import { Module } from '@nestjs/common';
import { JweService } from './jwe.service';
import { JweAuthGuard } from './jwe-auth.guard';
import { JoseWrapperService } from './jose-wrapper.service';

@Module({
  providers: [JweService, JweAuthGuard, JoseWrapperService],
  exports: [JweService, JweAuthGuard],
})
export class JweModule {}
