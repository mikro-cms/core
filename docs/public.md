[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Expose Public Resource</h1>

A public directory in web development is a designated folder in a project where static files such as HTML, CSS, JavaScript, images, and other assets are stored. These files are directly accessible by the client (e.g., web browsers) without any server-side processing. To expose your public resource, follow these steps:

```js
"public": {
  "endpoint": {
    "middleware": [
      "middleware name" or ["module name", "middleware name"]
    ],
    "path": "path_to_your_public_directories"
  }
}
```

- **endpoint**: A unique identifier for a specific public endpoint to your public resource.
- **middleware**: A collection of middleware used to intercept requests before granting access to public resources.
- **middleware name**: The name of the middleware in the collection.
- **module name**: The name of the module (optional; defaults to the module's own name if not specified).
- **path**: The path to your public directories that will be exposed.