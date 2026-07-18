import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solution } from './entities/solution.entity';

@Injectable()
export class SolutionsBankService {
  constructor(@InjectRepository(Solution) private readonly repo: Repository<Solution>) {}

  findAll(blocker?: string) {
    const where = blocker ? { blocker } : {};
    return this.repo.find({ where, order: { priority: 'DESC', created_at: 'DESC' } });
  }
}
