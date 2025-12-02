import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { UserPermission } from './permission.entity';

@Entity('user_permissions')
@Index(['userId'])
@Index(['permission'])
export class UserPermissionEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn({
    type: 'enum',
    enum: UserPermission,
  })
  permission: UserPermission;

  @ManyToOne(() => User, (user) => user.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
