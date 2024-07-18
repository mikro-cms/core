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
function (model, locale) {
  return function (req, res, next) {
    // Middleware logic goes here

    next();
  };
}
```

The middleware file exports a function that receives several parameters and returns an function:

### Parameters

- **model**: The method to access the collection of models has been initialized.
- **locale**: The method to access the collection of locale has been initialized.

### Return Values

The middleware function must return a function that will be set as a handler. This handler function can access the parameters `req`, `res`, and `next`.

[⬅️ Back to Configuration](./configuration.md)
