/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("recordGame", (table) => {
      table.increments("id").primary();
      table.integer("player1_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.integer("player2_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
      table.enu("result", ["win", "lose", "draw"]).notNullable();
      table.integer("winner_id").unsigned().nullable().references("id").inTable("users").onDelete("SET NULL"); // Nullable to allow draws
      table.string('room_no').notNullable()
,
      table.timestamps(true, true); // created_at and updated_at timestamps
    });
  };
  
  /**
   * @param { import("knex").Knex } knex
   * @returns { Promise<void> }
   */
  exports.down = function (knex) {
    return knex.schema.dropTableIfExists("recordGame");
  };
  