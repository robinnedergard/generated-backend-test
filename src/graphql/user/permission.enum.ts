import { registerEnumType } from '@nestjs/graphql';
import { UserPermission } from '../../users/entities/permission.entity';

registerEnumType(UserPermission, {
  name: 'UserPermission',
  description: 'User permission types',
});

export { UserPermission };
