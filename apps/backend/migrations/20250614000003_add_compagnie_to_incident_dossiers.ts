import type { Knex } from 'knex';

/**
 * Migration historique : `compagnie` est désormais créée par la migration
 * initiale. On n'ajoute la colonne que si elle est absente (bases migrées
 * depuis l'ancien schéma).
 */
export async function up(knex: Knex): Promise<void> {
  const hasCompagnie = await knex.schema.hasColumn('incident_dossiers', 'compagnie');
  if (hasCompagnie) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.string('compagnie', 100).notNullable().defaultTo('CAAR');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasCompagnie = await knex.schema.hasColumn('incident_dossiers', 'compagnie');
  if (!hasCompagnie) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.dropColumn('compagnie');
  });
}
