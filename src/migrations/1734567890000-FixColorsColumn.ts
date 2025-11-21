import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class FixColorsColumn1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the column exists
    const table = await queryRunner.getTable('products');
    const colorsColumn = table?.findColumnByName('colors');

    if (colorsColumn) {
      // First, normalize existing data to proper JSON format
      // Handle various formats: empty, comma-separated, or already JSON-like strings
      // Check the current column type first
      const columnType = colorsColumn.type;

      if (
        columnType === 'text' ||
        columnType === 'varchar' ||
        columnType === 'character varying'
      ) {
        // Column is currently text (simple-array), convert to JSON
        await queryRunner.query(`
          UPDATE products
          SET colors = CASE
            WHEN colors IS NULL OR colors = '' OR colors::text = '[]' THEN '[]'::json
            WHEN colors::text LIKE '[%]' THEN 
              CASE 
                WHEN colors::text ~ '^\\[.*\\]$' THEN colors::text::json
                ELSE '[]'::json
              END
            ELSE 
              -- Convert comma-separated string to JSON array
              ('["' || REPLACE(TRIM(colors::text), ',', '","') || '"]')::json
          END
        `);
      } else {
        // Column is already JSON, just normalize the data
        await queryRunner.query(`
          UPDATE products
          SET colors = CASE
            WHEN colors IS NULL OR colors::text = 'null' OR colors::text = '[]' THEN '[]'::json
            WHEN colors::text ~ '^\\[.*\\]$' THEN colors::json
            ELSE '[]'::json
          END
        `);
      }

      // Change column type from text to json
      await queryRunner.query(`
        ALTER TABLE products
        ALTER COLUMN colors TYPE json USING colors::json
      `);

      // Set default value
      await queryRunner.query(`
        ALTER TABLE products
        ALTER COLUMN colors SET DEFAULT '[]'::json
      `);
    } else {
      // If column doesn't exist, create it as JSON
      await queryRunner.addColumn(
        'products',
        new TableColumn({
          name: 'colors',
          type: 'json',
          default: "'[]'",
          isNullable: false,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to simple-array (text) type
    const table = await queryRunner.getTable('products');
    const colorsColumn = table?.findColumnByName('colors');

    if (colorsColumn) {
      // Convert JSON back to comma-separated string
      await queryRunner.query(`
        UPDATE products
        SET colors = (
          SELECT string_agg(value::text, ',')
          FROM json_array_elements_text(colors::json) AS value
        )
        WHERE colors IS NOT NULL AND colors::text != '[]'
      `);

      // Change column type back to text
      await queryRunner.query(`
        ALTER TABLE products
        ALTER COLUMN colors TYPE text USING colors::text
      `);

      // Remove default
      await queryRunner.query(`
        ALTER TABLE products
        ALTER COLUMN colors DROP DEFAULT
      `);
    }
  }
}
