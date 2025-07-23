// Sitemap generation utility
export const generateSitemap = () => {
  const baseUrl = 'https://skinvault.app';
  const currentDate = new Date().toISOString();
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/loadouts', priority: '0.9', changefreq: 'daily' },
    { url: '/sticker-crafts', priority: '0.9', changefreq: 'daily' },
    { url: '/resell-tracker', priority: '0.8', changefreq: 'hourly' },
    { url: '/contact', priority: '0.6', changefreq: 'monthly' },
    { url: '/legal-notice', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
  ];

  // Common categories for CS 2
  const categories = [
    'Knives', 'Gloves', 'Pistols', 'Rifles', 'SMGs', 'Heavy', 
    'Weapon Cases', 'Souvenir Cases', 'Collections', 'Stickers', 'Other', 'Paint'
  ];

  const categoryPages = categories.map(category => ({
    url: `/category/${encodeURIComponent(category)}`,
    priority: '0.8',
    changefreq: 'weekly'
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...categoryPages].map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Function to download sitemap
export const downloadSitemap = () => {
  const sitemap = generateSitemap();
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Function to get sitemap as string (for server-side generation)
export const getSitemapString = () => {
  return generateSitemap();
}; 