[⬅️ Back to Main](../README.md)

<h1 align="center">Make a Configuration</h1>

Configuration contains all the modules we have and passes them into mikro-cms initialization. The configuration can be stored in a separate file or included directly. Each module follows this format:

```js
module.exports = {
  "module_name": {
    "database": {},
    "schema": {},
    "model": {},
    "locale": {},
    "middleware": {},
    "router": {},
    "service": [],
    "public": {}
  }
}
```

- "module_name" is a unique name referring to our module.

## Read more documentation

- [Managing database connections efficiently](./database.md)
- [Defines the structure of your database tables](./schema.md)
- [Schema relationships and queries to the database tables](./model.md)
- [Language localization](./locale.md)
- [Defines methods to intercept requests](./middleware.md)
- [Organizing your application’s routing logic](./router.md)
- [Manage incoming requests and control how the server responds](./service.md)
- [Expose directories to the public](./service.md)

[⬅️ Back to Main](../README.md)
