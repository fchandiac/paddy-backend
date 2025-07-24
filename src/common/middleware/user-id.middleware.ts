import {
  Injectable,
  NestMiddleware,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../libs/entities/user.entity';

@Injectable()
export class UserIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('UserIdMiddleware');

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'];
      
      if (userId) {
        const id = parseInt(userId as string, 10);
        if (!isNaN(id)) {
          const user = await this.userRepo.findOne({ where: { id } });
          if (user) {
            (req as any).user = user;
            this.logger.debug(`User attached to request: ${user.id} (${user.email})`);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in UserIdMiddleware:', error);
    }
    
    next();
  }
}
