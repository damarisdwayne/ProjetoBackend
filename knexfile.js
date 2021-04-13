module.exports = {

  client: 'postgresql',
  connection: {
    database: 'knowledge',
    user: 'postgres',
    password: '123456'
  },
  pool: {
    min: 2,
    max: 50
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}

