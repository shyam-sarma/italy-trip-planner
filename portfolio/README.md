# Portfolio Site

A self-contained, single-file portfolio site for [@shyam-sarma](https://github.com/shyam-sarma).
No build step, no dependencies — just open `index.html`.

## How it works

- Everything (HTML, CSS, JS) lives in `index.html`.
- Projects, stats, and the language breakdown are fetched **live in the browser**
  from the public GitHub API (`api.github.com/users/shyam-sarma`), so the site
  stays current automatically — no rebuilds needed when you push new repos.
- Forked and archived repos are filtered out; projects are sorted by most recent push.
- If the GitHub API is rate-limited, the site degrades gracefully with a link to
  the GitHub profile.

## Preview locally

```bash
cd portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

The easiest path is a dedicated repo + GitHub Pages:

1. Create a new repo (e.g. `shyam-sarma/portfolio` — or `shyam-sarma.github.io`
   to get the root `https://shyam-sarma.github.io` URL).
2. Copy `index.html` into it and push.
3. In the repo: **Settings → Pages → Deploy from branch → main / root**.

It also works as-is on Netlify, Vercel, or Cloudflare Pages (drag-and-drop the
folder — it's a plain static site).

## Customizing

Open `index.html` and edit:

- **Tagline / hero text** — the `.hero` section near the top of `<body>`.
- **Username & colors** — `USERNAME` and `LANG_COLORS` in the `<script>` block,
  and the CSS variables in `:root` for the theme.
- **Contact links** — the `#contact` section.
