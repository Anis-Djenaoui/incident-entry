import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username', 255).notNullable();
    table.string('display_name', 255).notNullable();
    table.text('alfresco_ticket_encrypted').notNullable();
    table.text('session_hash').notNullable();
    table.timestamp('expires_at').notNullable();
    table.timestamp('last_activity').notNullable().defaultTo(knex.fn.now());
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('revoked').notNullable().defaultTo(false);

    table.unique(['session_hash']);
    table.index(['username']);
    table.index(['expires_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('user_sessions');
}
