# MyScoutee Template Frontend

A minimal Angular application built from MyScoutee's reusable foundations:
member, administrator and operator screens, profiles, consent, SmartList,
chat and video calls. Shared components, localization, notifications and guides
keep the original application's behavior.

| Explore | Link |
| --- | --- |
| Live demo | [Open the browser-local demo](https://fssrepository.github.io/myscoutee-template-frontend/) |
| Full project and backend | [MyScoutee Template](https://github.com/fssrepository/myscoutee-template) |
| Developer and operator guide | [PDF](https://github.com/fssrepository/myscoutee-template/blob/master/guides/manuals/MyScoutee_Template_Getting_Started_EN.pdf) |
| Shared UI library | [MyScoutee Components](https://github.com/fssrepository/myscoutee-components) |

## Run locally

```sh
git clone --recurse-submodules https://github.com/fssrepository/myscoutee-template-frontend.git
cd myscoutee-template-frontend
npm ci
npm start
```

Open `http://localhost:4200`. The local mode uses seeded IndexedDB data and
needs no backend. Live messaging and calls require the backend deployment.
For the complete development stack, follow the parent project's guide.

## Develop and build

| Command | Purpose |
| --- | --- |
| `npm run start:dev` | Frontend with the development HTTP backend |
| `npm test -- --watch=false` | Angular tests |
| `npm run build:prod` | Production HTTP application in `prod/` |
| `npm run build:github` | Browser-local Pages application in `docs/` |

The existing scripts build the `components` submodule before the application.
Local and HTTP adapters share the same contracts; see the
[core domain map](src/app/shared/core/README.md).

Shared component changes are committed once in the components repository and
published to its `origin`. Fetch that remote and check out the same published
commit here; never cherry-pick or recreate a component commit:

```sh
git -C components fetch origin
git -C components checkout --detach <published-components-commit>
git add components
```

Verify the commit belongs to `origin/master`, preserve dirty component work,
and commit the frontend gitlink. The versioned submodule update mode is
`checkout`: initialization restores the recorded commit without merging
component histories. A frontend gitlink commit only records that dependency.

## GitHub Pages

The automatic frontend CI build runs `npm run build:github`. Its optional manual
`deploy:github` job commits the generated `docs/` files to the permanent
`gh-pages` branch. GitHub Pages publishes that branch's `/docs` folder. Generated
files, including local fonts from `@fssrepository/myscoutee-components@1.5.0`,
are ignored on `master`.
The site uses `/myscoutee-template-frontend/`, including deep-link redirects.

## License

Based on [MyScoutee](https://github.com/fssrepository/myscoutee)
by MyScoutee (fssrepository). Copyright © 2026, fssrepository.
Licensed under [CC BY 4.0](LICENSE); see [BRANDING.md](BRANDING.md)
for logo restrictions.
