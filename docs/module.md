[⬅️ Back to Main](../README.md)

<h1 align="center">Developing a Module</h1>

If you want to develop a new module, please do not place your module directly in `node_modules`. Instead, create your module outside of that directory and add a symlink to it. This way, your module won't be deleted on `npm install`. You can follow these steps:

- Create a directory for your module.
- [Create a module configuration](./configuration.md)
- Navigate to your module directory and register it as a global module::

```sh
npm link
```

- Navigate to your workspace where the configuration file is located.
- Create a symlink to your module directory:

```sh
npm link your-module-name
```

- You can also add your module directory to nodemon's watch list.

[⬅️ Back to Main](../README.md)
