export interface NavItem {
  label: string;
  href: `#${string}`;
}

export interface CtaLink {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  target?: "_self" | "_blank";
  rel?: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface HeroSignal {
  label: string;
  value: string;
}

export interface HighlightItem {
  title: string;
  text: string;
}

export interface HeroContent {
  eyebrow: string;
  magicLabel: string;
  magicWords: string[];
  title: string;
  description: string;
  ctas: CtaLink[];
  resumeCta: CtaLink;
  signals: HeroSignal[];
  stats: HeroStat[];
  highlightsTitle: string;
  highlights: HighlightItem[];
}

export interface AboutPoint {
  title: string;
  description: string;
}

export interface AboutContract {
  title: string;
  detail: string;
}

export interface AboutInterestTrack {
  title: string;
  emphasis: string;
  description: string;
  level: number;
}

export interface AboutContent {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  paragraphs: string[];
  currentContracts: AboutContract[];
  focusAreas: AboutPoint[];
  interestTracks: AboutInterestTrack[];
}

export interface SectionContent {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}

export interface Project {
  name: string;
  emphasis: string;
  summary: string;
  description: string;
  highlights: string[];
  tech: string[];
  badges: string[];
  visual: "graph" | "booking" | "route" | "analytics" | "media";
}

export interface SkillGroup {
  title: string;
  description: string;
  items: string[];
  visual: "network" | "wave" | "stack" | "grid";
}

export interface StackCloudItem {
  label: string;
  icon: string;
}

export interface StackCloudContent {
  eyebrow: string;
  title: string;
  description: string;
  items: StackCloudItem[];
}

export interface ExperienceItem {
  title: string;
  organization: string;
  period: string;
  summary: string;
  bullets: string[];
}

export interface ContactItem {
  label: string;
  value: string;
  href?: string;
  note: string;
}

export interface ContactSectionContent extends SectionContent {
  intro: string;
  location: string;
  availability: string;
  contacts: ContactItem[];
}

export interface PortfolioData {
  brand: string;
  roleLabel: string;
  navigation: NavItem[];
  hero: HeroContent;
  about: AboutContent;
  featuredProjectsSection: SectionContent;
  featuredProjects: Project[];
  otherProjectsSection: SectionContent;
  otherProjects: Project[];
  skillsSection: SectionContent;
  skillsCloud: StackCloudContent;
  skillGroups: SkillGroup[];
  experienceSection: SectionContent;
  experience: ExperienceItem[];
  contactSection: ContactSectionContent;
  footer: {
    note: string;
    stack?: string;
  };
}
