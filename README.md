# Projects Portfolio

This repository hosts a lightweight portfolio (Vue 3 + Vite + Tailwind) to showcase selected projects for hiring teams. It extends the base Vue scaffold with:

- Dynamic project data in `src/data/projects.ts`
- Reusable type definitions in `src/types/project.ts`
- Project listing with tag filtering (`home.vue`)
- Individual project detail pages (`/projects/:slug`)
- Basic About & Contact pages

Customize the content quickly by editing the data file—no CMS required.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

Using Bun (preferred here):

```sh
bun install
```

Or with your preferred package manager.

### Compile and Hot-Reload for Development

```sh
bun run dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

### Type Check Only

```sh
bun run type-check
```

## Adding / Editing Projects

Edit `src/data/projects.ts` and update the `projects` array. Each project supports:

- `slug` (stable URL id)  
- `name`, `tagline`, `description`  
- `highlights`: bullet accomplishments / outcomes  
- `responsibilities`: what you personally owned  
- `stack`: technologies used  
- `links`: repo, live demo, docs, etc.  
- `tags`: used for filtering  
- `heroImage` & optional `gallery` image paths (place assets in `public/`)  

Order projects with the numeric `order` field (ascending). Mark standout examples with `featured: true` (you can adapt the UI later to spotlight them).

## Tailwind Dynamic Classes Note
If you introduce new tag colors, ensure their classes are present so Tailwind doesn't purge them. For safety, prefer a small mapping (e.g., `'violet': 'bg-violet-100 text-violet-700'`) instead of highly dynamic string interpolation.

## Suggested Content Tips
Keep descriptions outcome-focused: quantify improvements (latency ↓, conversion ↑, cost ↓). Use responsibilities to clarify your role vs. team scope.

## Roadmap Ideas
- Dark mode toggle
- Accessibility pass (keyboard focus outlines, reduced motion)
- Print / PDF export of selected projects
- Analytics event on outbound link clicks

## License
Add a license if you intend to open source (e.g., MIT). Currently unspecified.
