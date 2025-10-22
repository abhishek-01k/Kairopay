# @repo/tailwind-config

Shared Tailwind CSS configuration for the Kairopay monorepo.

## Usage

In your app's `globals.css`:

```css
@import 'tailwindcss';
@import '@repo/tailwind-config';
```

In your app's `postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

