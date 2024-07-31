[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Service </h1>

In the context of Express.js, an Express handler is a function that processes HTTP requests and sends back a response. In mikro-cms we refer to this as a service, which is used to manage incoming requests and control how the server responds.

```js
"service": [
  {
    "router": "endpoint of router" or ["module name", "endpoint of router"],
    "handler": {
      "endpoint": {
        "HTTP Method": require("path_to_service_file")
      }
    }
  }
]
```

- **router**: The router will be used.
- **endpoint of router**: The endpoint of the router within the collection.
- **module name**: The name of the module (optional; defaults to the module's own name if not specified).
- **handler**: A collection of endpoints, each with a method to handle HTTP requests for that endpoint.
- **endpoint**: A unique identifier for a specific API endpoint in your service, which maps to a handler function that processes incoming requests to that endpoint.
- **HTTP Method**: Specifies the allowed HTTP request methods (e.g., `all`, `get`, `post`, `put`, `delete`), each associated with a function that handles the respective request.

```js
function ({ env, model, locale, middleware }) {
  return [
    // all handler methods
  ];
}
```

The service file exports a function that receives several parameters and returns a array with collection of handler functions:

### Parameters

- **env**: The object contains environment data.
- **model**: The method to access the collection of models has been initialized.
- **locale**: The method to access the collection of locale has been initialized.
- **middleware**: The method to access the collection of middleware has been initialized.

### Return Values

The service function must return a collection of handler functions that will be set as handlers. These handler functions can access the parameters `req`, `res`, and `next`.

[⬅️ Back to Configuration](./configuration.md)
