import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HobbiesController } from './hobbies.controller';
import { HobbiesService } from './hobbies.service';
import { HobbyLog } from './entities/hobby-log.entity';
import { Hobby } from './entities/hobby.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hobby, HobbyLog])],
  controllers: [HobbiesController],
  providers: [HobbiesService],
  exports: [HobbiesService],
})
export class HobbiesModule {}
