import { expect, test, type Page, type TestInfo } from "@playwright/test";

const desktopProjectNames = new Set(["chromium", "firefox", "webkit"]);
const mobileProjectNames = new Set(["mobile-chrome", "mobile-safari"]);

async function openPortfolio(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "I build backend systems that make complex data work in the real world.",
    }),
  ).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );

  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectAnchoredSection(page: Page, sectionId: string) {
  const section = page.locator(`#${sectionId}`);

  await expect(page).toHaveURL(new RegExp(`#${sectionId}$`));

  // Assert the section heading, not the section itself. toBeInViewport measures
  // the visible area against the element's own area, so a tall section can never
  // reach a high ratio no matter how correctly it scrolled. Checking the heading
  // keeps this test independent of how much the section grows.
  await expect(section.getByRole("heading", { level: 2 })).toBeInViewport({
    ratio: 1,
  });

  // The section should also be anchored near the top of the viewport rather than
  // merely peeking in from the bottom.
  const viewportHeight = page.viewportSize()?.height ?? 0;

  await expect
    .poll(
      async () => (await section.boundingBox())?.y ?? Number.POSITIVE_INFINITY,
      { timeout: 8_000 },
    )
    .toBeLessThan(viewportHeight / 2);
}

async function countCanvasPixels(page: Page, selector: string) {
  return page.locator(selector).evaluate((canvasElement) => {
    const canvas = canvasElement as HTMLCanvasElement;
    const context = canvas.getContext("2d");

    if (!context || canvas.width === 0 || canvas.height === 0) {
      return 0;
    }

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let paintedPixels = 0;

    for (let index = 3; index < pixels.length; index += 64) {
      if (pixels[index] > 0) {
        paintedPixels += 1;
      }
    }

    return paintedPixels;
  });
}

test.describe("portfolio site", () => {
  let consoleFailures: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleFailures = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleFailures.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      consoleFailures.push(error.message);
    });
  });

  test.afterEach(() => {
    expect(consoleFailures).toEqual([]);
  });

  test("renders the core portfolio content, metadata, and local assets", async ({
    page,
  }) => {
    await openPortfolio(page);

    await expect(page).toHaveTitle("Jakub Wiśniewski | Developer Portfolio");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /backend-focused M\.Sc\. AI student/i,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://jakub-wisniewski.com/",
    );

    for (const sectionId of [
      "top",
      "about",
      "featured-projects",
      "other-projects",
      "skills",
      "experience",
      "contact",
    ]) {
      await expect(page.locator(`#${sectionId}`)).toHaveCount(1);
    }

    await expect(page.getByRole("heading", { name: "DataLab-PageRank" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "MSIT-Hotel-Booking" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "KULTour" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Auto-Analyst" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Movie-Recommendation" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Working Student - IT Architecture Support" }),
    ).toBeVisible();
    await expect(page.getByText(/LeanIX application portfolio/i).first()).toBeVisible();
    await expect(page.getByText(/content-hash-aware AnythingLLM REST updates/i)).toBeVisible();
    await expect(page.getByText("jakub.wisniewski.dev@gmail.com").first()).toBeVisible();

    await expect(page.locator('img[src$="pagerank-preview.webp"]')).toHaveJSProperty(
      "complete",
      true,
    );
    await expect(page.locator('img[src$="msit-hotel-booking.webp"]')).toHaveJSProperty(
      "complete",
      true,
    );
    await expect(page.locator('img[src$="kultour-map.webp"]')).toHaveJSProperty(
      "complete",
      true,
    );

    await expect((await page.request.get("/robots.txt")).ok()).toBe(true);
    await expect((await page.request.get("/sitemap.xml")).ok()).toBe(true);
    await expect((await page.request.get("/jakub-wisniewski-cv.pdf")).ok()).toBe(true);

    await expectNoHorizontalOverflow(page);
  });

  test("supports desktop anchor navigation and theme persistence", async ({
    page,
  }, testInfo: TestInfo) => {
    test.skip(
      !desktopProjectNames.has(testInfo.project.name),
      "Desktop navigation is covered by desktop browser projects.",
    );

    await openPortfolio(page);

    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });
    await primaryNavigation.getByRole("link", { name: "Projects" }).click();

    await expectAnchoredSection(page, "featured-projects");

    await primaryNavigation.getByRole("link", { name: "Contact" }).click();
    await expectAnchoredSection(page, "contact");

    await page.getByRole("button", { name: "Switch to light mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(page.getByRole("button", { name: "Switch to dark mode" })).toBeVisible();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("switches quick controls and keeps the selected modes", async ({ page }) => {
    await openPortfolio(page);

    await page.getByRole("button", { name: "Open quick controls" }).click();

    const panel = page.locator(".motion-mode-switcher__panel");
    await expect(panel).toHaveAttribute("aria-hidden", "false");

    await panel.getByRole("button", { name: /^Lite/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-performance", "lite");

    await panel.getByRole("button", { name: /^Experimental/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-mode", "experimental");

    await panel.getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator("#contact")).toBeInViewport({ ratio: 0.2 });

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-performance", "lite");
    await expect(page.locator("html")).toHaveAttribute("data-motion-mode", "experimental");
  });

  test("opens and closes expandable project media", async ({ page }) => {
    await openPortfolio(page);

    await page.getByRole("button", { name: "View poster" }).click();

    const dialog = page.getByRole("dialog", {
      name: "DataLab-PageRank expanded media",
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("img", { name: /Full project poster for the PageRank/i }),
    ).toBeVisible();

    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toBeHidden();
  });

  test("supports contact links and copy action", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            (window as Window & { __copiedText?: string }).__copiedText = value;
          },
        },
      });
    });

    await openPortfolio(page);

    const contact = page.locator("#contact");
    await contact.scrollIntoViewIfNeeded();

    await expect(contact.getByRole("link", { name: "Open PDF" })).toHaveAttribute(
      "href",
      /jakub-wisniewski-cv\.pdf$/,
    );
    await expect(contact.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "download",
      "",
    );
    await expect(
      contact.getByRole("link", { name: "jakub.wisniewski.dev@gmail.com" }),
    ).toHaveAttribute("href", "mailto:jakub.wisniewski.dev@gmail.com");
    await expect(contact.getByRole("link", { name: "github.com/D3prave" })).toHaveAttribute(
      "href",
      "https://github.com/D3prave",
    );
    await expect(contact.getByRole("link", { name: "linkedin.com/in/wis-jak" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/wis-jak",
    );

    const emailCard = contact.locator(".contact-card").filter({ hasText: "Email" });
    await emailCard.getByRole("button", { name: "Copy" }).click();
    await expect(emailCard.getByRole("button", { name: "Copied" })).toBeVisible();
    await expect(
      page.evaluate(() => (window as Window & { __copiedText?: string }).__copiedText),
    ).resolves.toBe("jakub.wisniewski.dev@gmail.com");
  });

  test("renders the stack cloud canvas", async ({ page }) => {
    await openPortfolio(page);

    await page.locator("#skills").scrollIntoViewIfNeeded();
    await expect(page.locator(".stack-cloud-canvas")).toBeVisible();

    await expect
      .poll(() => countCanvasPixels(page, ".stack-cloud-canvas"))
      .toBeGreaterThan(20);
  });

  test("supports mobile navigation", async ({
    page,
  }, testInfo: TestInfo) => {
    test.skip(
      !mobileProjectNames.has(testInfo.project.name),
      "Mobile navigation is covered by mobile browser projects.",
    );

    await openPortfolio(page);

    const menuButton = page.getByRole("button", { name: "Toggle navigation" });
    const primaryNavigation = page.getByRole("navigation", {
      name: "Primary navigation",
    });

    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await menuButton.click();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(primaryNavigation).toBeVisible();

    await primaryNavigation.getByRole("link", { name: "Skills" }).click();
    await expect(page).toHaveURL(/#skills$/);
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#skills")).toBeInViewport({ ratio: 0.1 });

    await expectNoHorizontalOverflow(page);
  });
});
