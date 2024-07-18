[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Database</h1>

Managing database connections efficiently is crucial for the performance and scalability of your application. The configuration file for mikro-cms allows you to define multiple database connections in a centralized manner. The database used by mikro-cms utilizes the Sequelize package. The database configuration references [Sequelize](https://www.npmjs.com/package/sequelize):

```js
"database": {
  "connection_name": {
    "database": "name_of_database",
    "username": "username_of_user",
    "password": "password_of_user",
    "sequelize": {
      "host": "hostname",
      "port": "port",
      "dialect": "mysql"
      // other Sequelize configurations
    }
  }
}
```

- **connection_name**: A unique name referring to our database connection.
- **database**: The name of the database.
- **username**: The username for the database.
- **password**: The password for the database.
- **sequelize**: Configuration settings for Sequelize.

[⬅️ Back to Configuration](./configuration.md)
