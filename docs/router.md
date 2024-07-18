[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Router</h1>

Express Router is a built-in feature of the Express.js framework that allows you to create modular, mountable route handlers. It is a powerful tool for organizing your application’s routing logic, making your code more modular and easier to maintain.

```js
"router": {
  "endpoint": [
    "middleware name" or ["module name", "middleware name"]
  ]
}
```

- **endpoint**: A unique identifier for a specific router endpoint in your application, which maps to a handler function that processes incoming requests to that endpoint.
- **middleware_name**: The name of the middleware in the collection.
- **module name**: The name of the module (optional; defaults to the module's own name if not specified).

[⬅️ Back to Configuration](./configuration.md)
