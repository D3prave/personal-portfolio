import type { PortfolioData } from "../types/portfolio";

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const portfolio: PortfolioData = {
  brand: "Jakub Wi\u015bniewski",
  roleLabel: "Developer focused on backend engineering, web crawling, enterprise systems, and data analytics",
  navigation: [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#featured-projects" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "Backend engineering, ML workflows, and data-heavy software systems",
    magicLabel: "Focused on",
    magicWords: [
      "backend systems",
      "ML workflows",
      "analytics products",
      "research tooling",
    ],
    title: "I build backend systems that make complex data work in the real world.",
    description:
      "I'm a backend-focused M.Sc. AI student at FAU with a B.Sc. in Data Science and experience in enterprise application portfolio governance, web crawling, research computing, and data-intensive software systems. I focus on backend engineering, RAG/analytics pipelines, and practical machine learning.",
    ctas: [
      { label: "View Featured Work", href: "#featured-projects", variant: "primary" },
      { label: "View Experience", href: "#experience", variant: "secondary" },
    ],
    resumeCta: {
      label: "Open CV",
      href: publicAsset("jakub-wisniewski-cv.pdf"),
      variant: "secondary",
      target: "_blank",
      rel: "noreferrer",
    },
    signals: [
      {
        label: "Current scope",
        value: "Siemens, KU student assistant",
      },
      {
        label: "Focus",
        value: "Backend, ML, analytics",
      },
      {
        label: "Studying",
        value: "M.Sc. AI @ FAU",
      },
      {
        label: "Based in",
        value: "Germany",
      },
    ],
    stats: [
      { value: "2", label: "active technical roles" },
      { value: "7", label: "selected software builds" },
      { value: "1", label: "technical profile across backend, ML, and analytics" },
    ],
    highlightsTitle: "Current and recent scope",
    highlights: [
      {
        title: "Enterprise application architecture",
        text: "Improve LeanIX application portfolio quality, coordinate with Mendix application managers on architecture diagrams, and explore enterprise AI and automation platforms at Siemens.",
      },
      {
        title: "KU student assistant work",
        text: "Work across KU's student-facing RAG chatbot crawler, research infrastructure support, technical documentation, and SampTA web operations.",
      },
      {
        title: "Data-intensive systems",
        text: "Build crawlers, analytics workflows, and backend-heavy projects where reliability, clear state, and usable reporting matter.",
      },
    ],
  },
  about: {
    id: "about",
    eyebrow: "About",
    title: "A developer profile grounded in real systems, real users, and real constraints.",
    description:
      "My background combines enterprise application portfolio governance, web crawling, research computing, backend engineering, and practical machine learning.",
    paragraphs: [
      "I completed my B.Sc. in Data Science at KU Eichst\u00e4tt-Ingolstadt with the thesis \"Detecting Hallucinations in Large Language Models Using Semantic Entropy\", and I am now studying for an M.Sc. in Artificial Intelligence at FAU Erlangen-N\u00fcrnberg.",
      "My work has spanned LeanIX application portfolio governance, enterprise architecture documentation, university RAG data pipelines, research infrastructure, and conference website work, which means documentation quality, technical clarity, operational reliability, and communication with different audiences all matter.",
      "That mix has shaped how I build. I prefer systems that are useful, maintainable, and grounded in real constraints: crawlers that can resume cleanly, APIs that handle failure well, analytics interfaces that explain system state, data pipelines that can scale, and user-facing applications that feel structured rather than improvised.",
    ],
    currentContracts: [
      {
        title: "Siemens",
        detail: "Working Student - IT Architecture Support",
      },
      {
        title: "KU Eichst\u00e4tt-Ingolstadt",
        detail: "Student Assistant - Crawler, research infrastructure, and web operations",
      },
    ],
    focusAreas: [
      {
        title: "Backend engineering",
        description:
          "Python-first work across APIs, crawlers, pipelines, databases, async workflows, monitoring, and reliability-focused processing.",
      },
      {
        title: "Machine learning and analytics",
        description:
          "Applied ML, recommendation workflows, RAG data ingestion, graph-oriented ranking logic, and analytics systems that support actual decisions and products.",
      },
      {
        title: "Enterprise and research systems",
        description:
          "Comfortable working with LeanIX portfolios, architecture diagrams, enterprise AI tooling, HPC support, Linux-based workflows, and mixed technical or non-technical stakeholders.",
      },
      {
        title: "Product delivery and UX",
        description:
          "I value polished interfaces, clear state handling, realistic business logic, and application structure that can grow beyond a demo.",
      },
    ],
    interestTracks: [
      {
        title: "Backend engineering",
        emphasis: "Primary build focus",
        description:
          "APIs, data pipelines, background work, reliability, observability, and maintainable service structure.",
        level: 95,
      },
      {
        title: "Machine learning",
        emphasis: "Applied, not decorative",
        description:
          "Recommendation logic, baseline models, graph ranking workflows, and ML that supports concrete use cases.",
        level: 84,
      },
      {
        title: "Data analytics",
        emphasis: "Operational and decision-oriented",
        description:
          "Dashboards, automated analysis, reporting flows, and interfaces that make technical signals easier to act on.",
        level: 90,
      },
    ],
  },
  featuredProjectsSection: {
    id: "featured-projects",
    eyebrow: "Featured Projects",
    title: "Selected work that best represents my technical direction.",
    description:
      "These projects reflect the mix I want to be known for: scalable backends, crawler pipelines, graph-oriented analysis, practical machine learning, and production-minded product design.",
  },
  featuredProjects: [
    {
      name: "KU AI Chatbot Crawler",
      emphasis:
        "Current university role. Sole developer of the Python crawling and ingestion pipeline for KU's student-facing RAG chatbot.",
      summary:
        "A crawler that maps and extracts roughly 20,200 German and English pages from ku.de into AnythingLLM-ready JSONL records.",
      description:
        "As a student assistant at KU Eichst\u00e4tt-Ingolstadt, I developed and maintain the end-to-end pipeline behind the university's student-facing RAG chatbot. It crawls multilingual web and PDF content, processes scanned documents with OCR, updates AnythingLLM selectively through content hashes, and produces coverage and quality evidence for every run.",
      proof: [
        { value: "20.2K", label: "pages covered" },
        { value: "15.5K", label: "German pages" },
        { value: "4.6K", label: "English pages" },
        { value: "JSONL", label: "RAG output" },
      ],
      highlights: [
        "Replaced a failing off-the-shelf scraper with a staged crawl, PDF fetch, OCR, and deduplication pipeline that checkpoints between stages.",
        "Discovers German and English content through sitemaps and extracts main content through whitelist-based rules, with configurable URL-prefix and language scopes.",
        "Uses SQLite crawl state and resumable incremental recrawls to handle large refreshes reliably.",
        "Integrates with the AnythingLLM REST API using content hashes, skipping unchanged pages and replacing only changed documents.",
        "Audits coverage against both the sitemap and the university CMS page tree, alongside error, render, duplication, and content-quality reports.",
        "Ships as a documented Docker image with a network-free pytest suite for reproducible deployment and handover.",
      ],
      tech: [
        "Python",
        "requests",
        "BeautifulSoup",
        "lxml",
        "Playwright",
        "OCR",
        "SQLite",
        "pytest",
        "Docker",
        "AnythingLLM",
        "REST API",
        "JSONL",
        "CLI tooling",
      ],
      badges: ["Current Role", "RAG Pipeline", "20.2K Pages"],
      visual: "graph",
    },
    {
      name: "DataLab-PageRank",
      emphasis:
        "Primary project. Large-scale citation crawling, monitoring, and HPC-backed PageRank analysis for academic graph data.",
      summary:
        "A citation crawler and analysis pipeline that processed 50 million papers and 531 million references, then computed PageRank scores on FAU Erlangen-Nuremberg supercomputing infrastructure.",
      description:
        "This project combines distributed crawling, monitoring, persistent storage, large-scale deduplication, and graph computation into one system shaped by real throughput and reliability constraints. It is the clearest representation of my interest in data-intensive systems, graph analytics, and scalable backend engineering.",
      proof: [
        { value: "50M", label: "papers crawled" },
        { value: "531M", label: "references processed" },
        { value: "FAU", label: "supercomputer compute" },
        { value: "FastAPI", label: "monitoring dashboard" },
      ],
      highlights: [
        "Successfully crawled 50 million papers and 531 million references from the Semantic Scholar API.",
        "Used Redis with Bloom filters for distributed queue management, fast membership checks, and large-scale deduplication.",
        "Applied batched API requests, batched database inserts, and retry strategies with exponential backoff for higher throughput and fault tolerance.",
        "Built a FastAPI dashboard to monitor crawler progress, throughput, and system health in real time.",
        "Used cloud instances for scalable crawl execution and FAU Erlangen-Nuremberg supercomputing resources for PageRank computations.",
        "Computed PageRank scores across the citation graph with damping-factor and dangling-node handling in the power iteration workflow.",
      ],
      tech: [
        "Python",
        "FastAPI",
        "Redis",
        "Bloom filters",
        "PostgreSQL",
        "Semantic Scholar API",
        "SLURM",
        "graph-tool",
        "NetworkX",
        "pandas",
        "scipy",
        "asyncssh",
        "paramiko",
        "Uvicorn",
      ],
      badges: ["50M Papers", "531M References", "HPC PageRank"],
      visual: "graph",
      media: {
        src: publicAsset("project-media/pagerank-preview.webp"),
        alt: "Preview of the PageRank project poster showing the title, crawler pipeline, graph construction, and implementation highlights.",
        fit: "cover",
        position: "center",
        cardVariant: "tall",
        expandable: true,
        expandLabel: "View poster",
        dialogSrc: publicAsset("project-media/pagerank-poster.webp"),
        dialogAlt:
          "Full project poster for the PageRank-based analysis of scientific paper influence, including crawler flow, graph construction, algorithm details, and results.",
        dialogFit: "contain",
      },
      repoUrl: "https://github.com/D3prave/DataLab-PageRank",
    },
    {
      name: "MSIT-Hotel-Booking",
      emphasis:
        "Full-stack product project with realistic business logic and operational structure.",
      summary:
        "A bilingual hotel booking platform designed for a bleisure-focused property, including customer and admin flows.",
      description:
        "The project demonstrates that I can build polished, production-oriented web applications instead of only technical prototypes. It includes booking lifecycle management, waitlist handling, dashboards, and transactional communication.",
      highlights: [
        "Bilingual English and German UI for a more realistic customer-facing product.",
        "Booking flows for rooms and services, including sold-out waitlist handling.",
        "User dashboard for stay management and admin dashboard for occupancy and revenue views.",
        "Structured around Supabase authentication, Postgres, and row-level security.",
      ],
      tech: [
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "Supabase",
        "PostgreSQL",
        "RLS",
        "Nodemailer",
        "Vercel",
      ],
      badges: ["Full-Stack Product", "Business Logic", "Bilingual UX"],
      visual: "booking",
      media: {
        src: publicAsset("project-media/msit-hotel-booking.webp"),
        alt: "Hero section of the MSIT hotel booking project with dark editorial styling and hospitality-focused branding.",
        fit: "cover",
        position: "50% 6%",
        cardVariant: "default",
      },
      repoUrl: "https://github.com/D3prave/MSIT-Hotel-Booking",
      liveUrl: "https://denkraum1886.vercel.app/",
    },
    {
      name: "KULTour",
      emphasis:
        "Hackathon-winning tourism personalization project built under tight delivery constraints.",
      summary:
        "A recommendation-driven travel concept that matches users with tourism options based on culture and personality signals.",
      description:
        "KULTour shows rapid team execution, recommendation system thinking, and the ability to translate data logic into a usable frontend experience. It should be read as both a technical and collaborative project.",
      highlights: [
        "Clearly marked as a hackathon-winning team project.",
        "Built collaborative filtering logic using SVD for cultural and personality-based recommendations.",
        "Created a backend API for frontend consumption and integrated Google APIs for external data.",
        "Delivered a map-based exploration interface under tight time constraints.",
      ],
      tech: [
        "Python",
        "Flask",
        "React",
        "Node.js",
        "Google APIs",
        "pandas",
        "scikit-learn",
        "Surprise",
        "matplotlib",
        "seaborn",
      ],
      badges: ["Hackathon Winner", "Recommendation System", "Team Project"],
      visual: "route",
      media: {
        src: publicAsset("project-media/kultour-map.webp"),
        alt: "KULTour interface showing an interactive tourism recommendation map with highlighted destinations and a destination detail panel.",
        fit: "cover",
        position: "50% 46%",
        cardVariant: "wide",
      },
      repoUrl: "https://github.com/D3prave/KULTour",
    },
  ],
  otherProjectsSection: {
    id: "other-projects",
    eyebrow: "Other Projects",
    title: "Additional work across LLM research, ML workflows, and recommendation interfaces.",
    description:
      "Supporting projects that reinforce my interest in LLM reliability, usable analytics tools, ML-enabled applications, and accessible user interfaces.",
  },
  otherProjects: [
    {
      name: "Semantic Entropy Thesis",
      emphasis:
        "Bachelor's thesis: Detecting Hallucinations in Large Language Models Using Semantic Entropy.",
      summary:
        "A reimplementation of semantic entropy (Farquhar et al., Nature 2024) that tests how well it flags wrong LLM answers compared with simpler uncertainty scores.",
      description:
        "The model answers the same question several times, answers with the same meaning are grouped, and the spread across groups signals risk. The public repository holds the LaTeX source, the experiment code, and the measurement files that every table and figure is rebuilt from.",
      highlights: [
        "Reimplemented semantic entropy by following the authors' released code.",
        "Evaluated Mistral-7B-Instruct, Llama-3.1-8B-Instruct, and Llama-3.1-70B-Instruct on TriviaQA, NQ-Open, SVAMP, and a long-form biography task.",
        "Compared against the original baselines, semantic entropy probes on hidden states, and entropy over normalized answer strings.",
        "Ran generation and clustering with Slurm on the NHR@FAU Alex and Fritz clusters.",
      ],
      tech: [
        "Python",
        "PyTorch",
        "Transformers",
        "vLLM",
        "scikit-learn",
        "Slurm",
        "LaTeX",
      ],
      badges: ["Bachelor's Thesis", "LLM Research", "HPC"],
      visual: "entropy",
      repoUrl: "https://github.com/D3prave/thesis",
    },
    {
      name: "Auto-Analyst",
      emphasis:
        "Automated exploratory analysis and baseline modeling for CSV datasets.",
      summary:
        "A full-stack tool that takes raw CSV input and turns it into exploratory analysis, baseline models, interactive predictions, and generated reports.",
      description:
        "This project connects frontend UX, backend orchestration, data preprocessing, model training, and report generation. It represents practical ML application design rather than isolated notebooks.",
      highlights: [
        "CSV upload workflow with automated EDA, cleaning, preprocessing, and baseline modeling.",
        "Hyperparameter tuning with Optuna and interactive prediction support.",
        "HTML and PDF report generation to make outputs easier to share.",
        "Redis-backed caching and Dockerized deployment for more operational realism.",
      ],
      tech: [
        "FastAPI",
        "React",
        "TypeScript",
        "pandas",
        "scikit-learn",
        "Optuna",
        "Redis",
        "Docker",
        "matplotlib",
        "Plotly",
      ],
      badges: ["Analytics Tool", "ML Workflow", "Full Stack"],
      visual: "analytics",
      repoUrl: "https://github.com/D3prave/Auto-Analyst",
    },
    {
      name: "Movie-Recommendation",
      emphasis:
        "Compact recommendation app with a clear user-facing interface.",
      summary:
        "An interactive movie recommendation application that pairs similarity-based logic with metadata and poster retrieval.",
      description:
        "While smaller in scope than the other projects, it demonstrates the ability to turn recommendation logic into a quick, understandable, demo-friendly interface.",
      highlights: [
        "Similarity-based movie recommendation workflow with interactive browsing.",
        "TMDB API integration for posters and metadata.",
        "Simple interface designed for quick demonstration and clear output.",
      ],
      tech: ["Python", "Streamlit", "pandas", "TMDB API", "Recommendation Logic"],
      badges: ["Recommendation App", "Demo-Friendly", "Applied ML"],
      visual: "media",
      media: {
        src: publicAsset("project-media/movie-recommendation.webp"),
        alt: "Movie recommendation app interface shown in dark mode with recommendation controls and tab navigation.",
        fit: "cover",
        position: "50% 0%",
        cardVariant: "tall",
      },
      repoUrl: "https://github.com/D3prave/Movie-Recommendation",
      liveUrl: "https://movie-recommendation-deprave.streamlit.app",
    },
  ],
  skillsSection: {
    id: "skills",
    eyebrow: "Skills and Stack",
    title: "Technical strengths across software delivery, data systems, and applied ML.",
    description:
      "The stack below reflects the tools I use most often in projects and work environments, together with the kinds of problems I am most interested in solving.",
  },
  skillsCloud: {
    eyebrow: "Current orbit",
    title: "Languages, frameworks, libraries, and core platforms I actually use.",
    description:
      "This cloud stays focused on the technologies you asked to keep: the main languages, frameworks, ML libraries, and core platforms that show up across my projects and day-to-day work.",
    items: [
      { label: "Python", icon: "/icons/cloud/python.svg" },
      { label: "JavaScript", icon: "/icons/cloud/javascript.svg" },
      { label: "TypeScript", icon: "/icons/cloud/typescript.svg" },
      { label: "React", icon: "/icons/cloud/react.svg" },
      { label: "Next.js", icon: "/icons/cloud/nextdotjs.svg" },
      { label: "Node.js", icon: "/icons/cloud/nodedotjs.svg" },
      { label: "Flask", icon: "/icons/cloud/flask.svg" },
      { label: "pandas", icon: "/icons/cloud/pandas.svg" },
      { label: "FastAPI", icon: "/icons/cloud/fastapi.svg" },
      { label: "NumPy", icon: "/icons/cloud/numpy.svg" },
      { label: "scikit-learn", icon: "/icons/cloud/scikitlearn.svg" },
      { label: "Tailwind CSS", icon: "/icons/cloud/tailwindcss.svg" },
      { label: "Vite", icon: "/icons/cloud/vite.svg" },
      { label: "PostgreSQL", icon: "/icons/cloud/postgresql.svg" },
      { label: "Redis", icon: "/icons/cloud/redis.svg" },
      { label: "Supabase", icon: "/icons/cloud/supabase.svg" },
      { label: "Vercel", icon: "/icons/cloud/vercel.svg" },
      { label: "Docker", icon: "/icons/cloud/docker.svg" },
      { label: "PyTorch", icon: "/icons/cloud/pytorch.svg" },
      { label: "TensorFlow", icon: "/icons/cloud/tensorflow.svg" },
      { label: "AWS", icon: "/icons/cloud/amazonwebservices.svg" },
      { label: "HTML5", icon: "/icons/cloud/html5.svg" },
      { label: "CSS", icon: "/icons/cloud/css.svg" },
      { label: "Linux", icon: "/icons/cloud/linux.svg" },
      { label: "Git", icon: "/icons/cloud/git.svg" },
      { label: "GitHub", icon: "/icons/cloud/github.svg" },
      { label: "Keras", icon: "/icons/cloud/keras.svg" },
      { label: "Matplotlib", icon: "/icons/cloud/matplotlib.svg" },
      { label: "Plotly", icon: "/icons/cloud/plotly.svg" },
    ],
  },
  skillGroups: [
    {
      title: "Core engineering",
      description:
        "Application and backend development with a focus on maintainable structure and real workflows.",
      visual: "network",
      items: [
        "Python",
        "TypeScript",
        "React",
        "Next.js",
        "FastAPI",
        "Flask",
        "Node.js",
        "SQL",
        "REST APIs",
      ],
    },
    {
      title: "Data and machine learning",
      description:
        "Applied analytics, model workflows, and graph-oriented data processing for research and production systems.",
      visual: "wave",
      items: [
        "pandas",
        "scikit-learn",
        "Optuna",
        "RAG data pipelines",
        "Web scraping",
        "PDF processing and OCR",
        "Graph analytics",
        "PageRank",
        "NetworkX",
        "graph-tool",
        "scipy",
        "Recommendation systems",
      ],
    },
    {
      title: "Infrastructure and platforms",
      description:
        "Operational tools and environments that support scalable or production-like applications.",
      visual: "stack",
      items: [
        "PostgreSQL",
        "SQLite",
        "Redis",
        "Supabase",
        "Docker",
        "Linux",
        "SLURM",
        "Vercel",
        "Azure DevOps",
        "pytest",
        "CLI tooling",
        "Uvicorn",
      ],
    },
    {
      title: "Working strengths",
      description:
        "Technical capabilities that matter in enterprise, research, and cross-functional settings.",
      visual: "grid",
      items: [
        "Application portfolio governance",
        "Architecture documentation",
        "System landscape analysis",
        "Technical reporting",
        "Coverage and QA reporting",
        "LeanIX portfolio quality",
        "HPC user support",
        "Debugging and troubleshooting",
        "Stakeholder communication",
        "Product thinking",
        "Agile collaboration",
      ],
    },
  ],
  experienceSection: {
    id: "experience",
    eyebrow: "Experience",
    title: "Industry, research, and enterprise exposure already shape how I work.",
    description:
      "My experience spans enterprise application portfolio governance, university RAG data pipelines, research infrastructure, conference web operations, and previous data and IT work in manufacturing environments.",
  },
  experience: [
    {
      title: "Working Student - IT Architecture Support",
      organization: "Siemens",
      period: "Mar 2026 - Present",
      summary:
        "Support application portfolio governance, architecture documentation, and technology exploration inside a large-scale enterprise IT environment.",
      bullets: [
        "Improve the quality and currency of the LeanIX application portfolio by reviewing and correcting incomplete or outdated architecture information.",
        "Contact Mendix application managers to create and update architecture diagrams, keeping solution views and dependencies aligned with the current IT landscape.",
        "Evaluate enterprise AI and automation platforms, including Altair, Microsoft Copilot Studio, UiPath, and KNIME, and document candidate use cases and findings.",
      ],
    },
    {
      title: "Student Assistant",
      organization: "KU Eichst\u00e4tt-Ingolstadt",
      period: "Jan 2026 - Present",
      summary:
        "Support KU work across an AI chatbot crawler, research infrastructure, documentation, and SampTA web operations.",
      bullets: [
        "AI chatbot crawler: Solely developed and maintained the Python crawling and ingestion pipeline behind KU's student-facing RAG chatbot, replacing a failing scraper and producing AnythingLLM-compatible JSONL from German and English ku.de content.",
        "Pipeline and ingestion: Built a checkpointed crawl, PDF fetch, OCR, and deduplication workflow with sitemap discovery, whitelist-based extraction, SQLite state, resumable incremental recrawls, and content-hash-aware AnythingLLM REST updates.",
        "QA and delivery: Audited coverage against the sitemap and CMS page tree, generated error and content-quality reports, added render audits and network-free tests, and containerized the documented pipeline with Docker for handover.",
        "Student research assistant: Supported Geography research workflows on the FAU Linux/SLURM cluster, including access setup, data transfer, execution support, and troubleshooting.",
        "Documentation: Wrote user-facing guidance for SSH access, remote execution, and cluster usage for non-technical researchers.",
        "Conference website: Developed and helped maintain the SampTA conference website, supporting content updates, hosting, and ongoing web operations.",
      ],
    },
    {
      title: "Data Science Intern",
      organization: "Kimball Electronics",
      period: "Aug 2025 - Oct 2025",
      summary:
        "Worked on database-focused IT support, production-adjacent analytics, and ML proof-of-concept work in a manufacturing environment.",
      bullets: [
        "Supported IT operations and database development through SQL optimization, triggers, and stored procedures.",
        "Analyzed scrap/repair, forecasting, and packaging datasets; built Repair vs. Scrap and TopLineForecast ML prototypes.",
        "Designed a Repair vs. Scrap prediction app proof of concept, improved trigger/workflow reliability, and presented work in Agile teams using Azure DevOps/Git.",
      ],
    },
  ],
  contactSection: {
    id: "contact",
    eyebrow: "Contact",
    title: "Connect with me.",
    description:
      "I am not actively looking for new roles, but I am happy to connect around technical work, software systems, research infrastructure, and projects worth discussing.",
    intro:
      "If you want to talk about backend engineering, machine learning, data analytics, graph-oriented systems, research computing support, or project implementation details, feel free to reach out.",
    location: "Based in Germany",
    availability:
      "Available for technical conversations, collaboration, and networking.",
    contacts: [
      {
        label: "CV / Resume",
        value: "Open PDF",
        href: publicAsset("jakub-wisniewski-cv.pdf"),
        target: "_blank",
        rel: "noreferrer",
        note: "PDF version of my experience and project background",
      },
      {
        label: "Email",
        value: "jakub.wisniewski.dev@gmail.com",
        href: "mailto:jakub.wisniewski.dev@gmail.com",
        note: "Preferred for direct outreach",
        copyValue: "jakub.wisniewski.dev@gmail.com",
      },
      {
        label: "GitHub",
        value: "github.com/D3prave",
        href: "https://github.com/D3prave",
        note: "Code samples and repositories",
      },
      {
        label: "LinkedIn",
        value: "linkedin.com/in/wis-jak",
        href: "https://linkedin.com/in/wis-jak",
        note: "Professional background and networking",
      },
    ],
  },
  footer: {
    note: "Portfolio of Jakub Wi\u015bniewski.",
  },
};
