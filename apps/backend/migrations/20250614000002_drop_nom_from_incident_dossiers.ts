import type { Knex } from 'knex';

/**
 * Migration historique : la colonne `nom` existait dans une version antérieure
 * du schéma. La migration initiale actuelle ne la crée plus ; on ignore donc
 * l'opération si elle est déjà absente.
 */
export async function up(knex: Knex): Promise<void> {
  const hasNom = await knex.schema.hasColumn('incident_dossiers', 'nom');
  if (!hasNom) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.dropColumn('nom');
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasNom = await knex.schema.hasColumn('incident_dossiers', 'nom');
  if (hasNom) {
    return;
  }

  await knex.schema.alterTable('incident_dossiers', (table) => {
    table.string('nom', 255).notNullable().defaultTo('');
  });
}
