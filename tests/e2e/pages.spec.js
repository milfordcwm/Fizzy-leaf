import {expect, test} from '@playwright/test';

/**
 * End-to-end coverage that every user-facing page renders. Each content page
 * must respond 200, mount the shared site chrome (header nav + footer), and
 * must NOT fall through to the root ErrorBoundary ("Oops" screen).
 */

/** Content pages that render a full HTML document. */
const contentPages = [
  {
    name: 'Home',
    path: '/',
    title: /Fizzy Leaf/,
    expectText: /Sparkling Hibiscus Tea/i,
  },
  {
    name: 'Shop',
    path: '/shop',
    title: /Shop · Fizzy Leaf/,
    expectText: /Tasting is believing/i,
  },
  {
    name: 'Locations',
    path: '/locations',
    title: /Locations · Fizzy Leaf/,
    expectText: /Find Fizzy Leaf Near You/i,
  },
  {
    name: 'Delivery',
    path: '/delivery',
    title: /Local Delivery · Fizzy Leaf/,
    expectText: /Local Delivery/i,
  },
  {
    name: 'Contact',
    path: '/contact',
    title: /Contact · Fizzy Leaf/,
    expectText: /love to hear from you/i,
  },
  {name: 'Collections', path: '/collections', expectText: /Collections/i},
  {name: 'All products', path: '/collections/all'},
  {name: 'Policies', path: '/policies', expectText: /Policies/i},
  {name: 'Blogs', path: '/blogs'},
  {name: 'Search', path: '/search'},
  {name: 'Cart', path: '/cart'},
];

test.describe('content pages render', () => {
  for (const page of contentPages) {
    test(`${page.name} (${page.path}) loads`, async ({page: browserPage}) => {
      const response = await browserPage.goto(page.path, {
        waitUntil: 'domcontentloaded',
      });

      expect(response, `no response for ${page.path}`).not.toBeNull();
      expect(response.status(), `status for ${page.path}`).toBe(200);

      // Shared chrome mounts on every page.
      await expect(browserPage.locator('header.site-header')).toBeVisible();

      // The root ErrorBoundary must not have caught anything.
      await expect(
        browserPage.getByRole('heading', {name: 'Oops'}),
      ).toHaveCount(0);

      if (page.title) {
        await expect(browserPage).toHaveTitle(page.title);
      }
      if (page.expectText) {
        await expect(browserPage.locator('body')).toContainText(
          page.expectText,
        );
      }
    });
  }
});

test.describe('shop shows live product pricing', () => {
  test('/shop renders a dollar price from the Storefront API', async ({
    page,
  }) => {
    await page.goto('/shop', {waitUntil: 'domcontentloaded'});
    await expect(page.locator('body')).toContainText(/\$\d+(\.\d{2})?/);
  });
});

test.describe('redirect routes', () => {
  test('/products/:handle redirects to /shop', async ({page}) => {
    await page.goto('/products/roselle-hibiscus');
    await expect(page).toHaveURL(/\/shop$/);
  });

  test('/discount/:code redirects away from the discount route', async ({
    request,
  }) => {
    const response = await request.get('/discount/E2E-TEST-CODE', {
      maxRedirects: 0,
    });
    expect([301, 302, 303]).toContain(response.status());
    const location = response.headers()['location'] || '';
    expect(location).not.toContain('/discount/');
  });
});

test.describe('auth-gated routes', () => {
  test('/account redirects to login when signed out', async ({request}) => {
    const response = await request.get('/account', {maxRedirects: 0});
    expect([301, 302]).toContain(response.status());
  });
});

test.describe('non-HTML routes', () => {
  test('/robots.txt is served as plain text', async ({request}) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    expect(await response.text()).toContain('User-agent');
  });

  test('/sitemap.xml is served as XML', async ({request}) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    expect(await response.text()).toMatch(/<(urlset|sitemapindex)/);
  });
});

test.describe('primary navigation works', () => {
  const navTargets = [
    {label: 'Locations', url: /\/locations$/},
    {label: 'Delivery', url: /\/delivery$/},
    {label: 'Contact', url: /\/contact$/},
  ];

  for (const target of navTargets) {
    test(`header nav → ${target.label}`, async ({page}) => {
      await page.goto('/', {waitUntil: 'domcontentloaded'});
      await page
        .locator('header.site-header')
        .getByRole('link', {name: target.label, exact: true})
        .click();
      await expect(page).toHaveURL(target.url);
      await expect(
        page.getByRole('heading', {name: 'Oops'}),
      ).toHaveCount(0);
    });
  }
});
