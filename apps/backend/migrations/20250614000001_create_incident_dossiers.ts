import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('incident_dossiers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('numero_dossier', 100).notNullable();
    table.string('compagnie', 100).notNullable();
    table.date('date_survenance').notNullable();
    table.string('immatriculation', 100).notNullable();
    table.string('nom_assure', 255).notNullable();
    table.string('nom_conducteur', 255).notNullable();
    table.string('nom_tier', 255).notNullable();
    table.string('numero_carte_orange', 100).notNullable();
    table.date('date_effet').notNullable();
    table.date('date_echeance').notNullable();
    table.string('nature_incident', 50).notNullable();
    table.decimal('provision', 12, 2).notNullable();
    table.text('generated_doc_path').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('incident_dossiers');
}
