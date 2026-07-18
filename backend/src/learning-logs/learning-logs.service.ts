import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateLearningLogDto, UpdateLearningLogDto } from './dto/learning-log.dto';
import { LearningLog } from './entities/learning-log.entity';

@Injectable()
export class LearningLogsService {
  constructor(@InjectRepository(LearningLog) private readonly repo: Repository<LearningLog>) {}

  create(user: User, dto: CreateLearningLogDto) {
    return this.repo.save(
      this.repo.create({
        user,
        log_date: new Date().toISOString().slice(0, 10),
        ...dto,
      }),
    );
  }

  async findAll(userId: string, skip = 0, take = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip,
      take,
    });
    return { data, total, page: Math.floor(skip / take) + 1 };
  }

  async findOne(id: string, userId: string) {
    const log = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!log) throw new NotFoundException('Learning log not found');
    return log;
  }

  async update(id: string, userId: string, dto: UpdateLearningLogDto) {
    const log = await this.findOne(id, userId);
    Object.assign(log, dto);
    return this.repo.save(log);
  }

  async remove(id: string, userId: string) {
    const log = await this.findOne(id, userId);
    await this.repo.remove(log);
    return { deleted: true };
  }

  async share(id: string, userId: string, platform: 'twitter' | 'linkedin') {
    const log = await this.findOne(id, userId);
    const text = `${log.title}\n\n${log.key_notes}\n\n#fixme #learning`;

    if (platform === 'twitter') {
      log.tweeted_to_twitter = true;
      log.tweet_url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    } else {
      log.posted_to_linkedin = true;
      log.linkedin_url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(log.code_link ?? 'https://example.com')}`;
    }

    await this.repo.save(log);

    return {
      shareUrl: platform === 'twitter' ? log.tweet_url : log.linkedin_url,
      tweetText: text,
    };
  }
}
