import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiService } from '../gemini/gemini.service';
import { User } from '../users/entities/user.entity';
import { CreateReelDto, UpdateReelDto } from './dto/reel.dto';
import { Reel } from './entities/reel.entity';

@Injectable()
export class ReelsVaultService {
  constructor(
    @InjectRepository(Reel) private readonly repo: Repository<Reel>,
    private readonly geminiService: GeminiService,
  ) {}

  async create(user: User, dto: CreateReelDto) {
    const title = dto.title ?? 'Saved Reel';
    const description = dto.description ?? 'User-saved Instagram reel';
    const ai_analysis = await this.geminiService.analyzeReel(dto.reel_url, title, description);

    return this.repo.save(
      this.repo.create({
        user,
        reel_url: dto.reel_url,
        title,
        description,
        user_notes: dto.user_notes ?? null,
        ai_analysis,
      }),
    );
  }

  async findAll(userId: string, category?: string, skip = 0, take = 10) {
    const where = category ? { user: { id: userId }, category } : { user: { id: userId } };
    const [data, total] = await this.repo.findAndCount({ where, skip, take, order: { created_at: 'DESC' } });
    return { data, total };
  }

  async findOne(id: string, userId: string) {
    const reel = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!reel) throw new NotFoundException('Reel not found');
    return reel;
  }

  async update(id: string, userId: string, dto: UpdateReelDto) {
    const reel = await this.findOne(id, userId);
    Object.assign(reel, dto);
    return this.repo.save(reel);
  }

  async remove(id: string, userId: string) {
    const reel = await this.findOne(id, userId);
    await this.repo.remove(reel);
    return { deleted: true };
  }

  async suggest(id: string, userId: string) {
    const reel = await this.findOne(id, userId);
    reel.use_count += 1;
    return this.repo.save(reel);
  }

  async suggestByBlocker(userId: string, blocker: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { use_count: 'DESC', created_at: 'DESC' },
      take: 5,
    }).then((reels) => reels.filter((reel) => reel.linked_triggers.includes(blocker) || reel.category?.includes(blocker)).slice(0, 5));
  }
}
