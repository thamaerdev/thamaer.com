# AGENTS.md

## Cache busting for CSS and JS

The site is plain static HTML with no build step. Browsers cache `css/site.css` and `js/site.js`, so every change to either file must also bump a version query string in `index.html`:

```html
<link rel="stylesheet" href="css/site.css?v=YYYYMMDDHHMM">
<script src="js/site.js?v=YYYYMMDDHHMM" defer></script>
```

Rules:

- Whenever you edit any CSS or JS file, update the `?v=` value on **every** reference to that file in `index.html` (and any other HTML page that references it).
- Use the current timestamp as the version, in the format `YYYYMMDDHHMM` (for example `202610302142`).
- If a new local CSS or JS file is added, reference it with a `?v=` query from the start.
- Do not add `?v=` to external URLs.
