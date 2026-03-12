# Personal Developer Portfolio

A single-page portfolio built with React, TypeScript, and Vite. The content is driven from a typed data file so you can edit copy, projects, skills, and contact details without touching the presentation layer.

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

## Deploy For Free

Recommended: Cloudflare Pages

- Why: best free fit for this site, very fast global edge delivery, simple GitHub integration, and a free `*.pages.dev` URL.
- Current official limits include 500 builds per month on the Free plan and deployment to Cloudflare's globally distributed network.
- Build settings for this repo:
  - Framework preset: `Vite`
  - Build command: `npm run build`
  - Build output directory: `dist`

Basic flow:

```bash
git init -b main
git add .
git commit -m "Initial portfolio site"
```

Then:

1. Create a new GitHub repository.
2. Add it as `origin`.
3. Push `main`.
4. In Cloudflare Pages, choose `Create application` -> `Pages` -> `Connect to Git`.
5. Select the GitHub repository and use the build settings above.

Alternative: GitHub Pages

- Best if you want the simplest GitHub-only setup.
- Free, but generally less performance-focused than Cloudflare Pages for this kind of static portfolio.
- Official GitHub Pages limits currently include a soft bandwidth limit of 100 GB/month and a soft limit of 10 builds/hour.

Useful docs:

- Cloudflare Pages Git integration: [developers.cloudflare.com/pages/get-started/git-integration/](https://developers.cloudflare.com/pages/get-started/git-integration/)
- Cloudflare Pages limits: [developers.cloudflare.com/pages/platform/limits/](https://developers.cloudflare.com/pages/platform/limits/)
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
