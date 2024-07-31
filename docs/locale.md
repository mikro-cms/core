[⬅️ Back to Configuration](./configuration.md)

<h1 align="center">Locale</h1>

Web localization is the process of adapting a website or web application to different languages and regions, making it suitable for users from various cultural backgrounds:

```js
"locale": {
  "language_code": require("path_to_locale_file")
}
```

- **language_code**: This follows the [ISO 639 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes).

The locale file should contain key-value pairs for the localization strings:

```js
module.exports = {
  “locale_id”: “locale format string”
}
```

- **locale_id**: A unique identifier for our locale.

The locale format string can include placeholders that are replaced with supplied properties during translation using `:key`.

```js
{
  "en": {
    "locale_id": "Hi, my name is :name"
  }
}
```

```js
locale("en", "locale_id", {
  "name": "mikro-cms"
});
```

The locale will output: "Hi, my name is mikro-cms"

## Accepted Languages

The application determines the locale based on the "Accepted-Languages" header specified in the request. This allows for automatically selecting the appropriate language code for use in translations for the user.

### req.trans

This method is an alternative for translations that do not require a language code. You can simply pass a `locale_id` or use it with binding data.

### req.transvalidator

This method extracts error messages produced by Express Validator, including those that contain a `locale_id`.

[⬅️ Back to Configuration](./configuration.md)
