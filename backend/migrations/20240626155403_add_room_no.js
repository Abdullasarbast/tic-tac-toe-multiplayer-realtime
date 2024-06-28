/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up (knex) {
    return knex.schema.table("recordGame", (table) => {
      table.string("roomNo").nullable();
    });
  }
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  export function down (knex) {
    return knex.schema.table("recordGame", (table) => {
      table.dropColumn("roomNo");
    });
  }
  