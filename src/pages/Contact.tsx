import { useState } from 'react';
import { Link } from 'react-router-dom';

type Language = 'en' | 'de';

const contactContent = {
  en: {
    title: 'Contact',
    content: `# Contact

## Contact Options

### Email
**General inquiries:** info@skinvault.app

### Postal Address
Lennard Klein
Königstr. 76
33098 Paderborn
Germany

---

## Response Times

We strive to answer all inquiries as quickly as possible:
- **Email inquiries:** Within 48 hours

## Common Inquiries

### Technical Support
For technical problems with the app:
- Describe the problem in detail
- Provide your browser and operating system
- Include screenshots if helpful

### Account Issues
For problems with your account:
- Provide your registered email address
- Describe the problem
- Use the password reset function for login problems

### Privacy Inquiries
For information, deletion, or correction of your data:
- Please send inquiries by email
- Provide your registered email address
- Describe your concern specifically

### Feedback and Suggestions
We welcome your feedback:
- Improvement suggestions
- Feature requests
- Praise and criticism

---

## Business Hours

**Monday to Friday:** 9:00 AM - 5:00 PM
**Weekend:** Limited support

*Outside business hours, response times may be longer.*

---

**Note:** These contact details apply only to SkinVault. For questions about CS 2 itself or Steam, please contact the respective official channels.`
  },
  de: {
    title: 'Kontakt',
    content: `# Kontakt

## Kontaktmöglichkeiten

### E-Mail
**Allgemeine Anfragen:** info@skinvault.app

### Postanschrift
Lennard Klein
Königstr. 76
33098 Paderborn
Deutschland

---

## Antwortzeiten

Wir bemühen uns, alle Anfragen schnellstmöglich zu beantworten:
- **E-Mail-Anfragen:** Innerhalb von 48 Stunden

## Häufige Anfragen

### Technischer Support
Bei technischen Problemen mit der App:
- Beschreiben Sie das Problem detailliert
- Geben Sie Ihren Browser und das Betriebssystem an
- Fügen Sie Screenshots bei, wenn hilfreich

### Account-Probleme
Bei Problemen mit Ihrem Konto:
- Geben Sie Ihre registrierte E-Mail-Adresse an
- Beschreiben Sie das Problem
- Nutzen Sie die Passwort-Reset-Funktion bei Login-Problemen

### Datenschutz-Anfragen
Für Auskunft, Löschung oder Berichtigung Ihrer Daten:
- Anfragen bitte per E-Mail
- Geben Sie Ihre registrierte E-Mail-Adresse an
- Beschreiben Sie Ihr Anliegen konkret

### Feedback und Vorschläge
Wir freuen uns über Ihr Feedback:
- Verbesserungsvorschläge
- Feature-Wünsche
- Lob und Kritik

---

## Geschäftszeiten

**Montag bis Freitag:** 9:00 - 17:00 Uhr
**Wochenende:** Eingeschränkter Support

*Außerhalb der Geschäftszeiten kann die Antwortzeit länger dauern.*

---

**Hinweis:** Diese Kontaktdaten gelten nur für SkinVault. Für Fragen zu CS 2 selbst oder Steam wenden Sie sich bitte an die entsprechenden offiziellen Kanäle.`
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
      
      // Handle bold text
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

export default function Contact() {
  const [language, setLanguage] = useState<Language>('en');

  const content = contactContent[language];

  return (
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
  );
} 