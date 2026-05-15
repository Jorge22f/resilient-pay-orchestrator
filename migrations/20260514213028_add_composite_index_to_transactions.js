/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    // A composite index speeds up lookups that filter by key and sort by date
    table.index(['idempotency_key', 'created_at'], 'idx_transactions_key_date');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropIndex(['idempotency_key', 'created_at'], 'idx_transactions_key_date');
  });
}