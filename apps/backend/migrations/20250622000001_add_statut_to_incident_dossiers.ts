import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasStatut = await knex.schema.hasColumn('incident_dossiers', 'statut');
  if (hasStatut) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.string('statut', 50).notNullable().defaultTo('ouvert');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasStatut = await knex.schema.hasColumn('incident_dossiers', 'statut');
  if (!hasStatut) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.dropColumn('statut');
  });
}
