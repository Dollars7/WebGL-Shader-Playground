# Legacy

The original coursework version, kept for reference. **This is not the active
project** — see the repository root for that.

| Directory            | What it is                                                    |
| -------------------- | ------------------------------------------------------------- |
| `homework/`          | Original assignment submission                                  |
| `shader-playground/` | First playground iteration built on top of it                   |
| `Common/`            | Course-provided WebGL helpers (`MV.js`, `initShaders.js`, …)   |
| `lib/`               | Mouse controls, skybox loader, and the cubemap as base64 JS    |

## Why it was rewritten

Everything here works, but it was built as coursework rather than as a
maintainable codebase:

- `shader-playground/app.js` is ~1300 lines with 100+ globals
- All nine shading models live in one 400-line `if/else` chain inside a
  `<script>` tag in the HTML
- The cubemap ships as six ~500KB JavaScript files, each assigning a base64
  data URL to a global
- No build step, no module system, no tests

The rewrite in `src/` addresses those; the architecture notes are in the root
`README.md`.

## Running it

These pages predate the build system and open directly in a browser:

```
legacy/shader-playground/index.html
```

`legacy/lib/skyboxAssets/` is still the source of truth for the cubemap —
`scripts/decode-skybox.js` reads from here to generate the PNGs the current
version loads.
