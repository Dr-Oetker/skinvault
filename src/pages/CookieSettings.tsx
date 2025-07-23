import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCookies } from '../store/cookies';

type Language = 'en' | 'de';

const cookieContent = {
  en: {
    title: 'Cookie Settings',
    content: `# Cookie Settings

## What are Cookies?

Cookies are small text files that are stored on your device when you visit our website. They help us make our service more user-friendly, effective, and secure.

## Types of Cookies We Use

### Essential Cookies
These cookies are necessary for the basic functionality of our website and cannot be disabled.

**What they do:**
- Maintain your login session
- Remember your language preferences
- Store your theme settings (dark/light mode)
- Ensure secure data transmission

**Legal basis:** Art. 6 para. 1 lit. f GDPR (Legitimate interests)

### Analytics Cookies
These cookies help us understand how visitors use our website.

**What they do:**
- Analyze website usage patterns
- Identify popular features
- Improve user experience
- Optimize website performance

**Legal basis:** Art. 6 para. 1 lit. f GDPR (Legitimate interests)

## Managing Your Cookie Preferences

### Browser Settings
You can control cookies through your browser settings:
- **Chrome:** Settings > Privacy and security > Cookies and other site data
- **Firefox:** Options > Privacy & Security > Cookies and Site Data
- **Safari:** Preferences > Privacy > Manage Website Data
- **Edge:** Settings > Cookies and site permissions > Cookies and site data

### Third-Party Cookies
Our website may use third-party services that set their own cookies:
- **Supabase:** For authentication and data storage
- **Analytics services:** For usage statistics

## Your Rights

### Right to Information
You have the right to be informed about:
- What cookies we use
- Why we use them
- How long they are stored
- Who has access to the data

### Right to Object
You can object to the use of cookies at any time:
- Disable cookies in your browser settings
- Contact us for specific cookie management
- Use browser extensions to block cookies

### Right to Deletion
You can delete stored cookies:
- Clear browser data
- Use incognito/private browsing
- Contact us for data deletion requests

## Cookie Duration

### Session Cookies
These cookies are automatically deleted when you close your browser:
- Login session data
- Temporary preferences
- Security tokens

### Persistent Cookies
These cookies remain on your device until you delete them:
- Language preferences
- Theme settings
- Analytics data (up to 2 years)

## Updates to This Policy

We may update our cookie policy from time to time. Changes will be:
- Announced on our website
- Communicated via email to registered users
- Effective 30 days after notification

## Contact

For questions about cookies or to exercise your rights:
- **Email:** info@skinvault.app
- **Subject:** Cookie Settings Inquiry

---

**Last updated:** July 16, 2025`
  },
  de: {
    title: 'Cookie-Einstellungen',
    content: `# Cookie-Einstellungen

## Was sind Cookies?

Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. Sie helfen uns dabei, unseren Service nutzerfreundlicher, effektiver und sicherer zu machen.

## Arten von Cookies, die wir verwenden

### Notwendige Cookies
Diese Cookies sind für die grundlegende Funktionalität unserer Website erforderlich und können nicht deaktiviert werden.

**Was sie tun:**
- Ihre Anmeldesitzung aufrechterhalten
- Ihre Spracheinstellungen merken
- Ihre Theme-Einstellungen speichern (Dunkel/Hell-Modus)
- Sichere Datenübertragung gewährleisten

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen)

### Analyse-Cookies
Diese Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen.

**Was sie tun:**
- Website-Nutzungsmuster analysieren
- Beliebte Funktionen identifizieren
- Benutzererfahrung verbessern
- Website-Performance optimieren

**Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen)

## Verwaltung Ihrer Cookie-Einstellungen

### Browser-Einstellungen
Sie können Cookies über Ihre Browser-Einstellungen kontrollieren:
- **Chrome:** Einstellungen > Datenschutz und Sicherheit > Cookies und andere Websitedaten
- **Firefox:** Optionen > Datenschutz & Sicherheit > Cookies und Website-Daten
- **Safari:** Einstellungen > Datenschutz > Website-Daten verwalten
- **Edge:** Einstellungen > Cookies und Website-Berechtigungen > Cookies und Website-Daten

### Drittanbieter-Cookies
Unsere Website kann Drittanbieter-Dienste verwenden, die ihre eigenen Cookies setzen:
- **Supabase:** Für Authentifizierung und Datenspeicherung
- **Analyse-Dienste:** Für Nutzungsstatistiken

## Ihre Rechte

### Recht auf Information
Sie haben das Recht, über Folgendes informiert zu werden:
- Welche Cookies wir verwenden
- Warum wir sie verwenden
- Wie lange sie gespeichert werden
- Wer Zugang zu den Daten hat

### Widerspruchsrecht
Sie können der Verwendung von Cookies jederzeit widersprechen:
- Cookies in Ihren Browser-Einstellungen deaktivieren
- Kontaktieren Sie uns für spezifische Cookie-Verwaltung
- Browser-Erweiterungen zum Blockieren von Cookies verwenden

### Recht auf Löschung
Sie können gespeicherte Cookies löschen:
- Browser-Daten löschen
- Inkognito/Privates Surfen verwenden
- Kontaktieren Sie uns für Löschungsanfragen

## Cookie-Dauer

### Session-Cookies
Diese Cookies werden automatisch gelöscht, wenn Sie Ihren Browser schließen:
- Anmelde-Sitzungsdaten
- Temporäre Einstellungen
- Sicherheitstoken

### Persistente Cookies
Diese Cookies bleiben auf Ihrem Gerät, bis Sie sie löschen:
- Spracheinstellungen
- Theme-Einstellungen
- Analyse-Daten (bis zu 2 Jahre)

## Aktualisierungen dieser Richtlinie

Wir können unsere Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Änderungen werden:
- Auf unserer Website angekündigt
- Per E-Mail an registrierte Nutzer kommuniziert
- 30 Tage nach Benachrichtigung wirksam

## Kontakt

Bei Fragen zu Cookies oder zur Ausübung Ihrer Rechte:
- **E-Mail:** info@skinvault.app
- **Betreff:** Cookie-Einstellungen Anfrage

---

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

export default function CookieSettings() {
  const [language, setLanguage] = useState<Language>('en');
  const { cookiesAccepted, cookiesEnabled, acceptCookies, declineCookies, setCookiesEnabled } = useCookies();
  const [showSettings, setShowSettings] = useState(false);

  const content = cookieContent[language];

  useEffect(() => {
    // Check if user has made a choice
    const hasChoice = localStorage.getItem('cookiesAccepted');
    if (hasChoice) {
      setShowSettings(true);
    }
  }, []);

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

      {/* Cookie Management Section */}
      {showSettings && (
        <div className="glass-card p-8 rounded-2xl shadow-dark-lg mt-8">
          <h2 className="text-2xl font-semibold text-dark-text-primary mb-6">Cookie Management</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-dark-text-primary mb-3">Current Status</h3>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${cookiesEnabled ? 'bg-accent-success' : 'bg-accent-error'}`}></div>
                <span className="text-dark-text-secondary">
                  Cookies are currently {cookiesEnabled ? 'enabled' : 'disabled'}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={acceptCookies}
                className="btn-primary"
              >
                Accept All Cookies
              </button>
              <button
                onClick={declineCookies}
                className="btn-secondary"
              >
                Decline Cookies
              </button>
            </div>

            <div className="text-sm text-dark-text-muted">
              <p>You can change your cookie preferences at any time. Changes will take effect immediately.</p>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="text-center mt-8">
        <Link to="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
} 