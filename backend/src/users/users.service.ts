import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserGoalsDto, UpdateUserProfileDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(data.email as string);
    if (existing) throw new ConflictException('Email already exists');
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email already exists');
    }

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitizeUser(saved);
  }

  async updateGoals(id: string, dto: UpdateUserGoalsDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitizeUser(saved);
  }
}
