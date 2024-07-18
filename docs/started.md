[⬅️ Back to Main](../README.md)

<h1 align="center">Getting Started</h1>

The mikro-cms is recommended to be run with the built-up [backend](https://github.com/mikro-cms/backend) which is set up and integrated with all default configurations. However, if you want to create it from scratch, follow these steps:

## Install Express App with Generator

```sh
npm install -g express-generator
```

```sh
express my-express-app
```

## Modify Express App

The generated Express app contains some sections that are not needed for our system because mikro-cms uses a reusable module architecture.

### Remove Package http-errors

The `https-error` package is a Node.js package that helps create and handle HTTP error responses in a structured and consistent manner, but we don't need it in `app.js`.

```js
 1. var createError = require('http-errors');
```

### Remove Subdirectories in Public

- Remove all subdirectories inside the `public` directory.
- Add a `.gitignore` file with blank content to the `public` directory.

### Remove Routes

- Remove the `routes` directory.
- Remove all related `routes` in app.js.

```js
 7. var indexRouter = require('./routes/index');
 8. var usersRouter = require('./routes/users');
---
22. var indexRouter = require('./routes/index');
23. var usersRouter = require('./routes/users');
```

### Remove Views

- Remove the `views` directory.
- Remove all related error handling views in `app.js`.

```js
22. // catch 404 and forward to error handler
23. app.use(function(req, res, next) {
24.   next(createError(404));
25. });
26. 
27. // error handler
28. app.use(function(err, req, res, next) {
29.   // set locals, only providing error in development
30.   res.locals.message = err.message;
31.   res.locals.error = req.app.get('env') === 'development' ? err : {};
32. 
33.   // render the error page
34.   res.status(err.status || 500);
35.   res.render('error');
36. });
```

### Add mikro-cms

First, install the @mikro-cms/core package.

```sh
npm install --save @mikro-cms/core
```

Then, load the package in `app.js`.

```js
var mikroCMS = require('mikro-cms');
```

Create a new configuration file for mikro-cms containing your custom configuration. Initially, you can start with an empty configuration.

```js
{}
```

Load the configuration file in `app.js`.

```js
var mikroConfig = require('./mikrocms.js');
```

Initialize mikro-cms before the last line of code `module.exports`.

```js
66. module.exports = app;
```

```js
mikroCMS(app, mikroConfig, function () {
  // callback
});
```

## Development with Nodemon

Nodemon is a utility that helps develop Node.js-based applications by automatically restarting the node application when file changes in the directory are detected. It is particularly useful for improving the development workflow by eliminating the need to manually restart the server every time changes are made.

### Install nodemon

```sh
npm install --save nodemon
```

### Customize how app starting

Update how to start the run script on package.json with these scripts:

```js
{
  "scripts": {
    "dev": "nodemon ./bin/www",
    "start": "node ./bin/www"
  },
  "nodemonConfig": {
    "watch": [
      "app.js",
      "bin",
      "mikrocms.js"
    ],
    "ext": "js,json",
    "delay": 2500
  }
}
```

By updating your package.json with these scripts and configurations, you streamline your development process. Running npm run dev will now start your application with nodemon, enabling automatic restarts upon detecting file changes, while running npm start will start the application without nodemon, suitable for production environments. To add more files or directories for nodemon to watch, simply update the watch array in the nodemonConfig section of your package.json.

[⬅️ Back to Main](../README.md)
