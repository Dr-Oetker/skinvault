import { useEffect } from 'react';
import { logoImage } from '../utils/images';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  canonical?: string;
  noIndex?: boolean;
  language?: string;
}

export default function SEO({
  title = 'SkinVault - CS 2 Skin Management & Trading Platform',
  description = 'Discover, manage, and track CS 2 skins, sticker crafts, and loadouts. Your ultimate hub for Counter-Strike 2 skin management with real-time pricing and resell tracking.',
  keywords = 'CS 2, Counter-Strike 2, skins, sticker crafts, loadouts, trading, Steam, gaming, weapons, knives, gloves',
  image = logoImage,
  url = 'https://skinvault.app',
  type = 'website',
  structuredData,
  canonical,
  noIndex = false,
  language = 'en'
}: SEOProps) {
  const fullUrl = canonical || `${url}${window.location.pathname}`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Primary Meta Tags
    updateMetaTag('title', title);
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    updateMetaTag('language', language);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;

    // Open Graph / Facebook
    updatePropertyTag('og:type', type);
    updatePropertyTag('og:url', fullUrl);
    updatePropertyTag('og:title', title);
    updatePropertyTag('og:description', description);
    updatePropertyTag('og:image', fullImageUrl);
    updatePropertyTag('og:site_name', 'SkinVault');
    updatePropertyTag('og:locale', 'en_US');

    // Twitter
    updatePropertyTag('twitter:card', 'summary_large_image');
    updatePropertyTag('twitter:url', fullUrl);
    updatePropertyTag('twitter:title', title);
    updatePropertyTag('twitter:description', description);
    updatePropertyTag('twitter:image', fullImageUrl);

    // Structured Data
    if (structuredData) {
      // Remove existing structured data
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Reset to default title when component unmounts
      document.title = 'SkinVault - CS 2 Skin Management & Trading Platform';
    };
  }, [title, description, keywords, fullUrl, fullImageUrl, type, structuredData, noIndex, language]);

  // This component doesn't render anything
  return null;
}

// Predefined SEO configurations for different page types
export const SEOPresets = {
  home: {
    title: 'SkinVault - CS 2 Skin Management & Trading Platform',
    description: 'Discover, manage, and track CS 2 skins, sticker crafts, and loadouts. Your ultimate hub for Counter-Strike 2 skin management with real-time pricing and resell tracking.',
    keywords: 'CS 2, Counter-Strike 2, skins, sticker crafts, loadouts, trading, Steam, gaming, weapons, knives, gloves',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SkinVault",
      "description": "CS 2 Skin Management & Trading Platform",
      "url": "https://skinvault.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://skinvault.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  
  loadouts: {
    title: 'CS 2 Loadouts - SkinVault',
    description: 'Browse and create CS 2 loadouts with the best skins and sticker combinations. Official and community loadouts for all weapons.',
    keywords: 'CS 2 loadouts, weapon skins, sticker combinations, Counter-Strike 2 loadouts, gaming loadouts',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "CS 2 Loadouts",
      "description": "Browse and create CS 2 loadouts with the best skins and sticker combinations",
      "url": "https://skinvault.app/loadouts"
    }
  },
  
  stickerCrafts: {
    title: 'CS 2 Sticker Crafts - SkinVault',
    description: 'Discover amazing CS 2 sticker crafts and combinations. Find the perfect sticker placement for your weapons.',
    keywords: 'CS 2 sticker crafts, sticker combinations, weapon stickers, Counter-Strike 2 stickers, gaming stickers',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "CS 2 Sticker Crafts",
      "description": "Discover amazing CS 2 sticker crafts and combinations",
      "url": "https://skinvault.app/sticker-crafts"
    }
  },
  
  weapon: (weaponName: string) => ({
    title: `${weaponName} Skins - CS 2 | SkinVault`,
    description: `Browse ${weaponName} skins for CS 2. Find the best ${weaponName} skins with prices, wear values, and rarity information.`,
    keywords: `${weaponName}, CS 2 skins, Counter-Strike 2, ${weaponName} skins, gaming skins`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${weaponName} Skins`,
      "description": `Browse ${weaponName} skins for CS 2`,
      "url": `https://skinvault.app/weapons/${encodeURIComponent(weaponName)}`
    }
  }),
  
  skin: (skinName: string, weaponName: string) => ({
    title: `${skinName} ${weaponName} Skin - CS 2 | SkinVault`,
    description: `${skinName} ${weaponName} skin for CS 2. View wear values, prices, and rarity information for this skin.`,
    keywords: `${skinName}, ${weaponName}, CS 2 skin, Counter-Strike 2, gaming skin`,
    type: 'product' as const,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": `${skinName} ${weaponName}`,
      "description": `${skinName} ${weaponName} skin for CS 2`,
      "category": "Gaming Skin",
      "brand": {
        "@type": "Brand",
        "name": "Counter-Strike 2"
      }
    }
  }),
  
  resellTracker: {
    title: 'CS 2 Resell Tracker - SkinVault',
    description: 'Track your CS 2 skin investments and monitor price changes. Get insights into skin market trends and resell opportunities.',
    keywords: 'CS 2 resell tracker, skin investment, price tracking, market trends, skin trading',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "CS 2 Resell Tracker",
      "description": "Track your CS 2 skin investments and monitor price changes",
      "url": "https://skinvault.app/resell-tracker"
    }
  },
  
  contact: {
    title: 'Contact Us - SkinVault',
    description: 'Get in touch with the SkinVault team. We\'re here to help with any questions about CS 2 skins and our platform.',
    keywords: 'contact SkinVault, CS 2 support, skin platform help, gaming support',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact SkinVault",
      "description": "Get in touch with the SkinVault team",
      "url": "https://skinvault.app/contact"
    }
  },
  
  legal: {
    title: 'Legal Notice - SkinVault',
    description: 'Legal information and disclaimers for SkinVault. Important legal details about our CS 2 skin management platform.',
    keywords: 'SkinVault legal notice, terms of service, privacy policy, legal information',
    noIndex: true
  },
  
  privacy: {
    title: 'Privacy Policy - SkinVault',
    description: 'Privacy policy for SkinVault. Learn how we protect your data and handle your information on our CS 2 skin platform.',
    keywords: 'SkinVault privacy policy, data protection, user privacy, CS 2 platform privacy',
    noIndex: true
  },
  
  terms: {
    title: 'Terms of Service - SkinVault',
    description: 'Terms of service for SkinVault. Read our terms and conditions for using our CS 2 skin management platform.',
    keywords: 'SkinVault terms of service, terms and conditions, user agreement, CS 2 platform terms',
    noIndex: true
  },
  
  category: (categoryName: string) => ({
    title: `${categoryName} Weapons - CS 2 | SkinVault`,
    description: `Browse ${categoryName} weapons and their skins for CS 2. Find the best ${categoryName} skins with prices, wear values, and rarity information.`,
    keywords: `${categoryName}, CS 2 weapons, Counter-Strike 2, ${categoryName} skins, gaming weapons, CS 2 ${categoryName}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryName} Weapons`,
      "description": `Browse ${categoryName} weapons and their skins for CS 2`,
      "url": `https://skinvault.app/category/${encodeURIComponent(categoryName)}`,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": []
      }
    }
  })
}; 