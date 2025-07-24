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
export class DebugMiddleware implements NestMiddleware {
  private readonly logger = new Logger('DebugMiddleware');

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug(`----------------------------------------`);
      this.logger.debug(`[REQUEST] ${req.method} ${req.url}`);
      
      // Log headers
      this.logger.debug('Headers:', JSON.stringify(req.headers, null, 2));
      
      // Log body for POST/PUT requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        this.logger.debug('Body:', JSON.stringify(req.body, null, 2));
      }
      
      // Process x-user-id header
      const userIdHeader = req.headers['x-user-id'];
      if (userIdHeader) {
        this.logger.debug(`x-user-id header found: ${userIdHeader}`);
        const userId = parseInt(userIdHeader as string, 10);
        
        if (!isNaN(userId)) {
          const user = await this.userRepo.findOne({ where: { id: userId } });
          if (user) {
            this.logger.debug(`User found: ${user.id} (${user.email})`);
            (req as any).user = user;
          } else {
            this.logger.warn(`No user found with ID: ${userId}`);
          }
        } else {
          this.logger.warn(`Invalid user ID: ${userIdHeader}`);
        }
      } else {
        this.logger.warn('No x-user-id header found');
      }
      
      // Capture the original response methods
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;
      
      // Override send to log the response
      res.send = function (body): Response {
        const logBody = typeof body === 'string' ? body : JSON.stringify(body);
        Logger.debug(`[RESPONSE] Status: ${res.statusCode}`);
        Logger.debug(`Body: ${logBody.length > 500 ? logBody.substring(0, 500) + '...' : logBody}`);
        Logger.debug(`----------------------------------------`);
        return originalSend.call(this, body);
      };
      
      // Override json to log the response
      res.json = function (body): Response {
        Logger.debug(`[RESPONSE] Status: ${res.statusCode}`);
        Logger.debug(`Body: ${JSON.stringify(body).length > 500 ? JSON.stringify(body).substring(0, 500) + '...' : JSON.stringify(body)}`);
        Logger.debug(`----------------------------------------`);
        return originalJson.call(this, body);
      };
      
      // Override end to log empty responses
      res.end = function (chunk): Response {
        if (!chunk) {
          Logger.debug(`[RESPONSE] Status: ${res.statusCode} (no body)`);
          Logger.debug(`----------------------------------------`);
        }
        return originalEnd.call(this, chunk);
      };
    } catch (error) {
      this.logger.error('Error in DebugMiddleware:', error);
    }
    
    next();
  }
}
