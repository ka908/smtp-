// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require("dotenv").config;
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: "smtp",
      user: "postgres",
      password: "admin",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
