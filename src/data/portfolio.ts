import type { PortfolioData } from "../types/portfolio";

export const portfolio: PortfolioData = {
  brand: "Jakub Wi\u015bniewski",
  roleLabel: "Developer focused on backend engineering, machine learning, and data analytics",
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
      "I work across Siemens, university research infrastructure, and conference web operations, building software that has to be reliable, clear, and useful beyond a demo. My focus is backend engineering, ML-enabled workflows, analytics tooling, and product delivery for technical environments.",
    ctas: [
      { label: "View Featured Work", href: "#featured-projects", variant: "primary" },
      { label: "View Experience", href: "#experience", variant: "secondary" },
    ],
    resumeCta: {
      label: "Open Resume",
      href: "/jakub-wisniewski-resume-placeholder.txt",
      variant: "secondary",
      target: "_blank",
      rel: "noreferrer",
    },
    signals: [
      {
        label: "Current scope",
        value: "Siemens, HPC, conference web",
      },
      {
        label: "Focus",
        value: "Backend, ML, analytics",
      },
      {
        label: "Studying",
        value: "B.Sc. Data Science",
      },
      {
        label: "Based in",
        value: "Germany",
      },
    ],
    stats: [
      { value: "3", label: "active technical roles" },
      { value: "5", label: "selected software builds" },
      { value: "1", label: "technical profile across backend, ML, and analytics" },
    ],
    highlightsTitle: "Current scope",
    highlights: [
      {
        title: "Enterprise IT architecture support",
        text: "Support architecture documentation, landscape analysis, reporting, and technology research inside a large-scale Siemens environment.",
      },
      {
        title: "Research infrastructure enablement",
        text: "Help researchers work effectively with Linux and SLURM-based HPC systems, from SSH setup and remote execution to troubleshooting and technical documentation.",
      },
      {
        title: "Conference website operations",
        text: "Run and extend the central SampTA conference website, covering cross-edition structure, implementation, and core information architecture.",
      },
    ],
  },
  about: {
    id: "about",
    eyebrow: "About",
    title: "A developer profile grounded in real systems, real users, and real constraints.",
    description:
      "My background combines backend engineering, machine learning workflows, analytics tooling, and hands-on support work in real technical environments.",
    paragraphs: [
      "My work already spans enterprise architecture support, research infrastructure, and conference website work at the same university, which means documentation quality, technical clarity, operational reliability, and communication with different audiences all matter.",
      "That mix has shaped how I build. I prefer systems that are useful, maintainable, and grounded in real constraints: APIs that handle failure well, analytics interfaces that explain system state, data pipelines that can scale, and user-facing applications that feel structured rather than improvised.",
    ],
    currentContracts: [
      {
        title: "Siemens",
        detail: "Working Student - IT Architecture Support",
      },
      {
        title: "University",
        detail: "Student Research Assistant",
      },
      {
        title: "University",
        detail: "Student Assistant - SampTA Conference Website",
      },
    ],
    focusAreas: [
      {
        title: "Backend engineering",
        description:
          "Python-first work across APIs, pipelines, databases, async workflows, monitoring, and reliability-focused processing.",
      },
      {
        title: "Machine learning and analytics",
        description:
          "Applied ML, recommendation workflows, graph-oriented ranking logic, and analytics systems that support actual decisions and products.",
      },
      {
        title: "Enterprise and research systems",
        description:
          "Comfortable working with architecture documentation, HPC support, Linux-based workflows, and mixed technical or non-technical stakeholders.",
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
      "These projects reflect the mix I want to be known for: scalable backends, graph-oriented analysis, practical machine learning, and production-minded product design.",
  },
  featuredProjects: [
    {
      name: "DataLab-PageRank",
      emphasis:
        "Primary project. Citation crawling, monitoring, and PageRank analysis for large academic graph data.",
      summary:
        "A scalable academic citation crawler, monitoring dashboard, and PageRank computation pipeline built around real graph-processing constraints.",
      description:
        "This project combines distributed crawling, fault-tolerant task handling, persistent storage, deduplication, and graph analysis into one coherent system. It is the clearest representation of my interest in data-intensive systems, graph analytics, and scalable backend engineering.",
      highlights: [
        "Crawls citation data from the Semantic Scholar API with retry logic and fault tolerance.",
        "Uses Redis for distributed task handling and PostgreSQL for persistent storage.",
        "Applies Bloom filters for deduplication and efficient large-scale crawl management.",
        "Exposes a FastAPI dashboard to monitor throughput, performance, and system health.",
        "Runs PageRank analysis on citation graphs with HPC-oriented design decisions and high-performance graph tooling.",
      ],
      tech: [
        "Python",
        "FastAPI",
        "Redis",
        "PostgreSQL",
        "Semantic Scholar API",
        "graph-tool",
        "NetworkX",
        "pandas",
        "scipy",
        "asyncssh",
        "paramiko",
        "Uvicorn",
      ],
      badges: ["Primary Project", "Graph Analytics", "Distributed Crawling"],
      visual: "graph",
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
    },
  ],
  otherProjectsSection: {
    id: "other-projects",
    eyebrow: "Other Projects",
    title: "Additional work across ML workflows and recommendation interfaces.",
    description:
      "Supporting projects that reinforce my interest in usable analytics tools, ML-enabled applications, and accessible user interfaces.",
  },
  otherProjects: [
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
        "Applied analytics, model workflows, and graph-oriented data processing.",
      visual: "wave",
      items: [
        "pandas",
        "scikit-learn",
        "Optuna",
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
        "Redis",
        "Supabase",
        "Docker",
        "Linux",
        "SLURM",
        "Vercel",
        "Azure DevOps",
        "Uvicorn",
      ],
    },
    {
      title: "Working strengths",
      description:
        "Technical capabilities that matter in enterprise, research, and cross-functional settings.",
      visual: "grid",
      items: [
        "Architecture documentation",
        "System landscape analysis",
        "Technical reporting",
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
      "My experience spans three current technical roles across enterprise architecture support, academic infrastructure, and conference web operations, together with previous data and IT work in manufacturing environments.",
  },
  experience: [
    {
      title: "Working Student - IT Architecture Support",
      organization: "Siemens",
      period: "Current",
      summary:
        "Support architecture documentation and analysis work inside a large-scale enterprise IT environment.",
      bullets: [
        "Create and maintain solution architecture overviews and related documentation.",
        "Assist with analysis of IT system landscapes and business processes to identify optimization opportunities.",
        "Prepare presentations and reports that support architecture decision-making.",
        "Research current trends in IT architecture and cloud platforms.",
      ],
    },
    {
      title: "Student Research Assistant",
      organization: "University",
      period: "Current",
      summary:
        "Support research workflows, technical enablement, and the practical use of HPC infrastructure.",
      bullets: [
        "Help non-technical researchers with SSH setup, remote execution, data transfer, and troubleshooting.",
        "Write technical guides and documentation for Linux and cluster-based workflows.",
        "Support computational work on Linux and SLURM environments.",
      ],
    },
    {
      title: "Student Assistant - Conference Website",
      organization: "University",
      period: "Current",
      summary:
        "Own the setup and operation of the central SampTA conference website as a separate student assistant contract at the same university.",
      bullets: [
        "Set up and operate a central website that aggregates information across multiple conference editions.",
        "Implement the core conference website functionality and structure.",
        "Support ongoing content organization and a usable information architecture for the series.",
        "Translate conference requirements into a maintainable web presence rather than a one-off event page.",
      ],
    },
    {
      title: "Data Scientist",
      organization: "Kimball Electronics",
      period: "Previous",
      summary:
        "Worked on database-focused IT support, production-adjacent analytics, and ML proof-of-concept work in an industrial environment.",
      bullets: [
        "Supported IT operations and database development with SQL optimization, triggers, and stored procedures.",
        "Analyzed production-related datasets and built decision-support visualizations.",
        "Developed ML proof-of-concept models and presented results to mixed technical audiences.",
        "Worked in Agile delivery settings using Azure DevOps.",
      ],
    },
    {
      title: "IT Intern",
      organization: "Kimball Electronics",
      period: "Previous",
      summary:
        "Handled internal tooling support and lightweight automation work.",
      bullets: [
        "Maintained internal .NET tools used for operational work.",
        "Automated recurring tasks with Excel and VBA.",
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
        label: "Email",
        value: "jakub.wisniewski.dev@gmail.com",
        href: "mailto:jakub.wisniewski.dev@gmail.com",
        note: "Preferred for direct outreach",
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
