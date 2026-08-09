# Fonts

`roboto-latin-var.woff2` — Roboto, latin subset, variable weight 400–700.
43 KB, one file for every weight the site uses.

Served from this repository rather than from a font CDN, so the published
site makes no third-party requests at runtime.

Roboto is licensed under the Apache License 2.0. Upstream:
https://github.com/googlefonts/roboto-3-classic

The unicode-range in `assets/css/styles.css` matches the latin subset this
file contains. Anything outside that range falls through to the system
stack declared in `--font-sans`.
