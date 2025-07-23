import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO, { SEOPresets } from '../components/SEO';

type Language = 'en' | 'de';

const legalNoticeContent = {
  en: {
    title: 'Legal Notice',
    content: `# Legal Notice

**Information according to § 5 TMG:**

- **Name/Company:** Lennard Klein
- **Address:** Königstr. 76
- **ZIP Code, City:** 33098 Paderborn
- **Country:** Germany

**Contact:**
- **Email:** info@skinvault.app

**Responsible for content according to § 55 Abs. 2 RStV:**
- Lennard Klein
- Königstr. 76, 33098, Paderborn, Germany

---

## Disclaimer

### Liability for Content
The contents of our pages have been created with the greatest care. However, we cannot guarantee the accuracy, completeness and timeliness of the content. As service providers, we are liable for our own content on these pages in accordance with § 7 para.1 TMG under the general laws. However, according to §§ 8 to 10 TMG, we as service providers are not under the obligation to monitor transmitted or stored third-party information or to research circumstances that indicate illegal activity.

### Liability for Links
Our offer contains links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any guarantee for these external contents. The respective provider or operator of the pages is always responsible for the contents of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal contents were not recognizable at the time of linking.

### Copyright
The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution and any kind of exploitation outside the limits of the copyright law require the written consent of the respective author or creator.

**Last updated:** July 16, 2025`
  },
  de: {
    title: 'Impressum',
    content: `# Impressum

**Angaben gemäß § 5 TMG:**

- **Name/Unternehmen:** Lennard Klein
- **Adresse:** Königstr. 76
- **PLZ, Ort:** 33098 Paderborn
- **Land:** Deutschland

**Kontakt:**
- **E-Mail:** info@skinvault.app

**Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:**
- Lennard Klein
- Königstr. 76, 33098, Paderborn, Deutschland

---

## Haftungsausschluss

### Haftung für Inhalte
Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.

### Haftung für Links
Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Illegale Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.

### Urheberrecht
Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.

**Stand:** 16. Juli 2025`
  }
};

// Function to render formatted content
const renderFormattedContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  
  let currentList: React.ReactElement[] = [];
  let inList = false;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('# ')) {
      // Main heading
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(
        <h1 key={index} className="text-3xl font-bold text-dark-text-primary mb-6">
          {trimmedLine.substring(2)}
        </h1>
      );
    } else if (trimmedLine.startsWith('## ')) {
      // Sub heading
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(
        <h2 key={index} className="text-2xl font-semibold text-dark-text-primary mb-4 mt-8">
          {trimmedLine.substring(3)}
        </h2>
      );
    } else if (trimmedLine.startsWith('### ')) {
      // Sub-sub heading
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(
        <h3 key={index} className="text-xl font-semibold text-dark-text-primary mb-3 mt-6">
          {trimmedLine.substring(4)}
        </h3>
      );
    } else if (trimmedLine.startsWith('- ')) {
      // List item
      if (!inList) {
        inList = true;
      }
      // Remove the - and process bold text in list items
      let listItem = trimmedLine.substring(2);
      const boldRegex = /\*\*(.*?)\*\*/g;
      const boldParts = listItem.split(boldRegex);
      if (boldParts.length > 1) {
        const formattedParts = boldParts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-semibold text-dark-text-primary">{part}</strong> : part
        );
        currentList.push(<span key={`list-item-${index}`}>{formattedParts}</span>);
      } else {
        currentList.push(<span key={`list-item-${index}`}>{listItem}</span>);
      }
    } else if (trimmedLine === '---') {
      // Horizontal rule
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(
        <hr key={index} className="border-dark-border-primary/60 my-8" />
      );
    } else if (trimmedLine === '') {
      // Empty line
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      elements.push(<div key={index} className="h-4"></div>);
    } else {
      // Regular paragraph
      if (inList && currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
            {currentList.map((item, i) => (
              <li key={i} className="ml-4">{item}</li>
            ))}
          </ul>
        );
        currentList = [];
        inList = false;
      }
      
      // Handle bold text and other formatting
      let formattedLine = trimmedLine;
      
      // Handle lines that start with ** but don't have closing ** (like section headers)
      if (formattedLine.startsWith('**') && !formattedLine.includes('**', 2)) {
        formattedLine = formattedLine.replace(/^\*\*/, ''); // Remove leading **
        elements.push(
          <h3 key={index} className="text-lg font-semibold text-dark-text-primary mb-3 mt-4">
            {formattedLine}
          </h3>
        );
      } else {
        // Handle bold text with proper opening and closing **
        const boldRegex = /\*\*(.*?)\*\*/g;
        const boldParts = formattedLine.split(boldRegex);
        if (boldParts.length > 1) {
          const formattedParts = boldParts.map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-semibold text-dark-text-primary">{part}</strong> : part
          );
          elements.push(
            <p key={index} className="text-dark-text-secondary leading-relaxed mb-4">
              {formattedParts}
            </p>
          );
        } else {
          // Remove any remaining markdown symbols that shouldn't be displayed
          formattedLine = formattedLine.replace(/^#{1,6}\s*/, ''); // Remove heading symbols
          formattedLine = formattedLine.replace(/^- /, ''); // Remove list symbols
          formattedLine = formattedLine.replace(/^---$/, ''); // Remove horizontal rule symbols
          
          if (formattedLine.trim() !== '') {
            elements.push(
              <p key={index} className="text-dark-text-secondary leading-relaxed mb-4">
                {formattedLine}
              </p>
            );
          }
        }
      }
    }
  });
  
  // Handle any remaining list
  if (inList && currentList.length > 0) {
    elements.push(
      <ul key="final-list" className="list-disc list-inside space-y-1 mb-4 text-dark-text-secondary">
        {currentList.map((item, i) => (
          <li key={i} className="ml-4">{item}</li>
        ))}
      </ul>
    );
  }
  
  return elements;
};

export default function LegalNotice() {
  const [language, setLanguage] = useState<Language>('en');

  const content = legalNoticeContent[language];

  return (
    <>
      <SEO {...SEOPresets.legal} />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-dark-text-primary mb-4">{content.title}</h1>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                language === 'en'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('de')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                language === 'de'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'text-dark-text-secondary hover:text-dark-text-primary'
              }`}
            >
              Deutsch
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="glass-card p-8 rounded-2xl shadow-dark-lg">
          <div className="max-w-none">
            {renderFormattedContent(content.content)}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
} 