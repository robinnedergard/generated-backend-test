import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddUserIdToCheckouts1734568000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add userId column
    await queryRunner.addColumn(
      'checkouts',
      new TableColumn({
        name: 'userId',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'checkouts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the foreign key to drop it
    const table = await queryRunner.getTable('checkouts');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('checkouts', foreignKey);
    }

    // Drop the column
    await queryRunner.dropColumn('checkouts', 'userId');
  }
}
