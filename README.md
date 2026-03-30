# Personal Developer Portfolio

A single-page portfolio built with React, TypeScript, and Vite. The content is driven from a typed data file so you can edit copy, projects, skills, and contact details without touching the presentation layer.

## Live Site

[jakub-wisniewski.com](https://jakub-wisniewski.com)

## Folder Structure

```text
.
|-- index.html
|-- package.json
|-- tsconfig.app.json
|-- tsconfig.json
|-- tsconfig.node.json
|-- vite.config.ts
`-- src
    |-- App.tsx
    |-- index.css
    |-- main.tsx
    |-- components
    |   |-- AboutSection.tsx
    |   |-- ContactSection.tsx
    |   |-- ExperienceSection.tsx
    |   |-- Header.tsx
    |   |-- HeroSection.tsx
    |   |-- ProjectCard.tsx
    |   |-- ProjectsSection.tsx
    |   |-- SectionIntro.tsx
    |   |-- SkillsSection.tsx
    |   `-- TimelineItem.tsx
    |-- data
    |   `-- portfolio.ts
    `-- types
        `-- portfolio.ts
```

## Component Structure

- `App.tsx`: page composition and section ordering.
- `Header.tsx`: sticky top navigation and positioning line.
- `HeroSection.tsx`: opening headline, quick-scan profile signals, CTA buttons, credibility stats, current focus panel, and quick contact links.
- `AboutSection.tsx`: personal summary and focus areas.
- `ProjectsSection.tsx`: reusable section wrapper for featured and supporting projects.
- `ProjectCard.tsx`: shared project card component with emphasis, highlights, and tech stack.
- `SkillsSection.tsx`: grouped technical stack and working strengths.
- `ExperienceSection.tsx`: short experience timeline.
- `TimelineItem.tsx`: reusable timeline entry.
- `ContactSection.tsx`: closing CTA and contact methods.

## Edit Content

Update [`src/data/portfolio.ts`](/Users/deprave/Documents/PersonalWebsite/src/data/portfolio.ts) to change:

- hero copy
- quick-scan hero signals
- project descriptions and ordering
- skills
- experience summaries
- contact details and links

The only placeholders left intentionally are the contact links and any future personal branding you want to add, such as your full name.

## Run Locally

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
npm run preview
```

## SEO and Observability

- The site ships with search/discovery assets in [`public/robots.txt`](/Users/deprave/Documents/PersonalWebsite/public/robots.txt), [`public/sitemap.xml`](/Users/deprave/Documents/PersonalWebsite/public/sitemap.xml), [`public/site.webmanifest`](/Users/deprave/Documents/PersonalWebsite/public/site.webmanifest), [`public/browserconfig.xml`](/Users/deprave/Documents/PersonalWebsite/public/browserconfig.xml), [`public/humans.txt`](/Users/deprave/Documents/PersonalWebsite/public/humans.txt), and [`public/.well-known/security.txt`](/Users/deprave/Documents/PersonalWebsite/public/.well-known/security.txt).
- Social, canonical, and structured-data tags live in [`index.html`](/Users/deprave/Documents/PersonalWebsite/index.html).
- Workers routing is configured in [`wrangler.jsonc`](/Users/deprave/Documents/PersonalWebsite/wrangler.jsonc) to serve the site on `jakub-wisniewski.com` and disable the public `workers.dev` hostname on deploy.
- Optional Cloudflare Web Analytics support is wired in [`src/components/CloudflareWebAnalytics.tsx`](/Users/deprave/Documents/PersonalWebsite/src/components/CloudflareWebAnalytics.tsx). Set `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN` before `npm run build` if you want Cloudflare's browser-side beacon on a plain static deployment.
- For a Worker that only serves static assets, the Workers `Metrics` tab is not the right observability surface. Cloudflare serves those static requests at no charge, and the useful measurement layer here is Web Analytics in the browser, not Workers logs/traces.
- After deployment, add the site to Google Search Console and submit `https://jakub-wisniewski.com/sitemap.xml`. That step cannot be completed from inside the repo, but it is the normal follow-up if you want Google to discover updates faster.

## Deploy For Free

Current setup: Cloudflare Workers with a custom domain

- The repo deploys with Wrangler via `npm run deploy`.
- [`wrangler.jsonc`](/Users/deprave/Documents/PersonalWebsite/wrangler.jsonc) is configured to attach the Worker to `jakub-wisniewski.com` and `www.jakub-wisniewski.com` as Custom Domains and disable the public `workers.dev` hostname.
- The repo pins Node.js with [`.node-version`](/Users/deprave/Documents/PersonalWebsite/.node-version) and adds Cloudflare static headers in [`public/_headers`](/Users/deprave/Documents/PersonalWebsite/public/_headers).

Deploy with Wrangler:

```bash
npm run deploy
```

After deploy, verify in Cloudflare:

1. `Workers & Pages` -> `portfolio` -> `Settings` -> `Domains & Routes`.
2. Confirm `jakub-wisniewski.com` and `www.jakub-wisniewski.com` are listed as Custom Domains.
3. Confirm `workers.dev` is disabled.
4. Add a Redirect Rule from `www.jakub-wisniewski.com/*` to `https://jakub-wisniewski.com/${1}` so the apex domain stays canonical.

Alternative: Cloudflare Pages

Repository prep:

```bash
git add .
git commit -m "Initial portfolio site"
git remote add origin git@github.com:YOUR_USERNAME/personal-portfolio.git
git push -u origin main
```

Cloudflare Pages setup:

1. In Cloudflare, go to `Workers & Pages`.
2. Select `Create application` -> `Pages` -> `Connect to Git`.
3. Authorize the GitHub app and select your repository.
4. Choose `main` as the production branch.
5. Use the build settings above.
6. Save and deploy.

Important:

- You must push at least one branch to GitHub before Cloudflare can select the production branch.
- If you ever want stricter Cloudflare-managed project config in-repo, add a `wrangler.toml` later. For this static site, the Git-integrated dashboard setup is the simpler option.

Alternative: GitHub Pages

- Best if you want the simplest GitHub-only setup.
- Free, but generally less performance-focused than Cloudflare Pages for this kind of static portfolio.
- Official GitHub Pages limits currently include a soft bandwidth limit of 100 GB/month and a soft limit of 10 builds/hour.

Useful docs:

- Cloudflare Pages Git integration: [developers.cloudflare.com/pages/get-started/git-integration/](https://developers.cloudflare.com/pages/get-started/git-integration/)
- Cloudflare Pages headers: [developers.cloudflare.com/pages/configuration/headers/](https://developers.cloudflare.com/pages/configuration/headers/)
- Cloudflare Pages build image and Node pinning: [developers.cloudflare.com/pages/configuration/build-image/](https://developers.cloudflare.com/pages/configuration/build-image/)
- GitHub Pages limits: [docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## GitHub Profile Notes

Do not fake or backdate commit history. GitHub uses commit author dates on your profile, and rewritten history can create visibly inconsistent timelines inside repositories.

Better ways to make the profile stronger:

- pin this portfolio and your best 5 repositories
- add a strong GitHub profile README
- add screenshots and architecture notes to key repos
- use repository topics and a clean description
- create releases for major milestones
- keep future commits small, real, and well named

Relevant GitHub docs:

- Profile contributions reference: [docs.github.com/en/account-and-profile/reference/profile-contributions-reference](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference)
- Private contribution visibility: [docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/showing-your-private-contributions-and-achievements-on-your-profile](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/showing-your-private-contributions-and-achievements-on-your-profile)
