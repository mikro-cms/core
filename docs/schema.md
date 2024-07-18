[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Schema</h1>

The schema configuration defines the structure of your database tables using Sequelize models. Each model represents a table in your database. Below is an example schema configuration containing all common Sequelize schema options:

```js
"schema": {
  "schema_name": {
    "connection": "name of the database connection",
    "structure": require("path_to_schema_file")
  }
}
```

- **schema_name**: A unique name referring to our schema.
- **connection**: Name of the database connection (optional, will use 'default' if not defined).
- **structure**: Reference will be embed to defining the model.

```js
function (DataTypes) {
  return {
    attributes: {
      // defining the fields of the model
    },
    options: {
      tableName: "name_of_table",
      // other Sequelize schema options
    }
  };
}
```

The model file exports a function that receives several parameters and returns an object.

### Parameters

- **DataTypes**: An instance from Sequelize DataTypes.

### Return Values

The schema function must return an object containing:

- **attributes**: An object defining the fields of the model. Each field is represented by an attribute with properties that describe its type and constraints.
- **options**: Additional configuration options for the model. This can include settings like table name, timestamps, and more.

[⬅️ Back to Configuration](./configuration.md)
