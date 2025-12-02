import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreatePermissionSystem1734568200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(`
      CREATE TYPE user_permission_enum AS ENUM (
        'admin:read',
        'products:read',
        'products:write',
        'orders:read',
        'orders:write',
        'permissions:read',
        'permissions:write'
      )
    `);

    // Create the user_permissions junction table
    await queryRunner.createTable(
      new Table({
        name: 'user_permissions',
        columns: [
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'permission',
            type: 'user_permission_enum',
            isPrimary: true,
          },
        ],
      }),
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'user_permissions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Add indexes for performance
    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'IDX_user_permissions_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'user_permissions',
      new TableIndex({
        name: 'IDX_user_permissions_permission',
        columnNames: ['permission'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    const table = await queryRunner.getTable('user_permissions');
    if (table) {
      const userIdIndex = table.indices.find(
        (idx) => idx.name === 'IDX_user_permissions_userId',
      );
      if (userIdIndex) {
        await queryRunner.dropIndex('user_permissions', userIdIndex);
      }

      const permissionIndex = table.indices.find(
        (idx) => idx.name === 'IDX_user_permissions_permission',
      );
      if (permissionIndex) {
        await queryRunner.dropIndex('user_permissions', permissionIndex);
      }

      // Drop foreign key
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_permissions', foreignKey);
      }
    }

    // Drop the table
    await queryRunner.dropTable('user_permissions');

    // Drop the enum type
    await queryRunner.query(`DROP TYPE IF EXISTS user_permission_enum`);
  }
}
