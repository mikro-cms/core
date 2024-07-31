[⬅️ Back to Main](../README.md)

<h1 align="center">Make a Configuration</h1>

Configuration includes environment settings and all the modules we have, and it is passed into the mikro-cms initialization. The configuration can be stored in a separate file or included directly. Each module follows this format:

```js
module.exports = {
  "env": {},
  "modules": {
    "module_name": {
      "database": {},
      "schema": {},
      "model": {},
      "locale": {},
      "view": [],
      "middleware": {},
      "router": {},
      "service": [],
      "public": {}
    }
  }
}
```

- "env" configuration data and shared data
- "modules" contains all the modules we have

## Read more documentation

- [Configuration data](./environment.md)
- [Managing database connections efficiently](./database.md)
- [Defines the structure of your database tables](./schema.md)
- [Schema relationships and queries to the database tables](./model.md)
- [Language localization](./locale.md)
- [Setting Up the View Folder](./view.md)
- [Defines methods to intercept requests](./middleware.md)
- [Organizing your application’s routing logic](./router.md)
- [Manage incoming requests and control how the server responds](./service.md)
- [Expose directories to the public](./service.md)

[⬅️ Back to Main](../README.md)
