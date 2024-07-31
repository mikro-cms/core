[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Model</h1>

Models contain all methods callable by our service and other models to process queries to the database tables. We can also define schema relationships within the migration method.

```js
"model": {
  "model_name": require("path_to_model_file")
}
```

- **model_name**: A unique name referring to our model.

```js
function ({ env, db, schema, model }) {
  function migration() {
    // Define migrations here
  }

  return {
    migration,
    // other model methods
  };
}
```

The model file exports a function that receives several parameters and returns an object.

### Parameters

- **env**: The object contains environment data.
- **db**: The method to access the collection database connection has been initialized.
- **schema**: The method to access the collection of schemas has been initialized.
- **model**: The method to access the collection of models has been initialized.

### Return Values

The model function must return an object containing:

- **migration**: The method that will be called before model initialization.
- **method**: All methods callable by other models or services.

[⬅️ Back to Configuration](./configuration.md)
