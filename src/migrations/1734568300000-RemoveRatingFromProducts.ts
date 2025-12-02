import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveRatingFromProducts1734568300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'rating');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'rating',
        type: 'decimal',
        precision: 3,
        scale: 2,
        default: 0,
        isNullable: false,
      }),
    );
  }
}
