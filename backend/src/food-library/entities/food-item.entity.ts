import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('food_library')
export class FoodItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() type: string; // SNACK | DINNER | GROCERY
  @Column({ type: 'varchar', nullable: true }) difficulty: string;
  @Column({ type: 'varchar', nullable: true }) prep_time: string;
  @Column({ type: 'varchar', nullable: true }) protein_level: string; // HIGH | MEDIUM | LOW
  @Column({ nullable: true, type: 'text' }) description: string;
  @Column({ default: true }) is_active: boolean;
}
