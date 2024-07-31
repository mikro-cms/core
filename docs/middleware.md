[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Model</h1>

The middleware configuration defines methods to intercept requests.

```js
"middleware": {
  "middleware_name": require("path_to_middleware_file")
}
```

- **middleware_name**: A unique name referring to our middleware.

```js
function ({ env, model, locale, middleware }) {
  return [
    // all handler methods
  ];
}
```

The middleware file exports a function that receives several parameters and returns an function:

### Parameters

- **env**: The object contains environment data.
- **model**: The method to access the collection of models has been initialized.
- **locale**: The method to access the collection of locale has been initialized.
- **middleware**: The method to access the collection of middleware has been initialized.

### Return Values

The middleware function must return a collection of handler functions that will be set as handlers. These handler functions can access the parameters `req`, `res`, and `next`.

[⬅️ Back to Configuration](./configuration.md)
