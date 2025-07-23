import { useState } from 'react';
import { Link } from 'react-router-dom';

type Language = 'en' | 'de';

const termsContent = {
  en: {
    title: 'Terms of Service',
    content: `# Terms of Service

## 1. Scope
These Terms of Service govern the use of the SkinVault web application ("the App") and all associated services. By using our App, you agree to these terms.

## 2. Service Description
SkinVault is a web application for managing CS 2 skin collections. The service allows users to:
- Browse and manage skins
- Create and save loadouts
- View sticker combinations
- Track investments
- Collect favorites

## 3. Registration and User Account

### 3.1 Registration
- You must register to use all features of the App
- You must provide a valid email address
- You are required to provide truthful information
- Only one account per person is allowed

### 3.2 Account Security
- You are responsible for the security of your account and password
- Do not share your login credentials with third parties
- Notify us immediately of unauthorized use
- Use a secure password

### 3.3 Account Suspension
- False or misleading information may result in suspension
- Violations of these Terms of Service will result in suspension
- We reserve the right to suspend accounts without prior notice

## 4. Permitted Use

### 4.1 Intended Use
- The App is exclusively for managing CS 2 skin collections
- Use for private, non-commercial purposes
- Compliance with all applicable laws and regulations

### 4.2 Commercial Use
- Commercial use requires our express written consent
- Unauthorized commercial use results in immediate suspension
- Direct commercial use inquiries to our support

## 5. Prohibited Activities

You agree to refrain from the following activities:
- Transmission of malware, viruses, or harmful code
- Disrupting platform functionality or servers
- Circumventing security measures
- Unauthorized automated access (bots, scrapers)
- Violating third-party rights
- Spam or unwanted advertising
- Misuse of rating or comment functions
- Use for illegal purposes

## 6. Content and Intellectual Property

### 6.1 User-Generated Content
- You retain rights to your uploaded content (loadouts, notes)
- By uploading, you grant us the right to use, store, and display content
- Content must be legal, appropriate, and free of rights violations
- We may remove content without prior notice

### 6.2 Platform Content
- All App content (design, code, text) is protected by copyright
- Unauthorized use or reproduction is prohibited
- Skin images and data come from publicly available sources

## 7. Prices and Market Data

### 7.1 Price Information
- All price information is provided as estimates without guarantee
- Prices can change rapidly
- We assume no liability for the accuracy of price data

### 7.2 Data Sources
- Data comes from various publicly available sources
- We regularly review data but cannot guarantee completeness
- Users should verify prices independently before making important decisions

## 8. Availability and Maintenance

### 8.1 Availability
- We strive for high App availability
- Maintenance work may cause temporary interruptions
- We will inform about scheduled maintenance when possible

### 8.2 Technical Issues
- We are not liable for outages or technical problems
- Report problems through our support channels
- We strive for quick problem resolution

## 9. Termination of Use

### 9.1 Termination by User
- You may delete your account at any time
- Contact our support or use the deletion function
- After deletion, your data will be handled according to our Privacy Policy

### 9.2 Termination by Us
- We may suspend accounts for violations of these terms
- Serious violations may result in immediate suspension
- You will be notified by email upon suspension

## 10. Disclaimer

### 10.1 General Disclaimer
- Use of the App is at your own risk
- We provide no warranty for data accuracy
- Use of price data for investment decisions is at your own risk

### 10.2 Limitation of Liability
- We are only liable for intent and gross negligence
- For slight negligence, we are only liable for breach of essential contractual obligations
- Liability is limited to foreseeable damages
- We are not liable for lost profits or consequential damages

## 11. Changes to Terms of Service

### 11.1 Right to Modify
- We may modify these Terms of Service at any time
- Changes will be communicated by email at least 30 days before taking effect
- Significant changes will be announced in the App

### 11.2 Right to Object
- You may object to changes within 30 days
- Objection results in termination of usage rights
- Continued use after changes take effect constitutes acceptance

## 12. Data Protection
The protection of your data is important to us. Details about data processing can be found in our Privacy Policy.

## 13. Final Provisions

### 13.1 Severability Clause
Should individual provisions of these Terms of Service be invalid, the validity of the remaining provisions remains unaffected.

### 13.2 Applicable Law
German law applies, excluding the UN Convention on Contracts for the International Sale of Goods.

### 13.3 Jurisdiction
The place of jurisdiction for all disputes is [Your location/company headquarters], provided you are a merchant, legal entity under public law, or special fund under public law.

---

**Last updated:** July 16, 2025

**Contact for questions:**
Email: info@skinvault.app`
  },
  de: {
    title: 'Nutzungsbedingungen',
    content: `# Nutzungsbedingungen

## 1. Geltungsbereich
Diese Nutzungsbedingungen regeln die Nutzung der SkinVault Webanwendung ("die App") und aller damit verbundenen Dienste. Durch die Nutzung unserer App stimmen Sie diesen Bedingungen zu.

## 2. Dienstleistungsbeschreibung
SkinVault ist eine Webanwendung zur Verwaltung von CS 2 Skin-Sammlungen. Der Dienst ermöglicht es Nutzern:
- Skins zu durchsuchen und zu verwalten
- Loadouts zu erstellen und zu speichern
- Sticker-Kombinationen anzusehen
- Investitionen zu verfolgen
- Favoriten zu sammeln

## 3. Registrierung und Benutzerkonto

### 3.1 Registrierung
- Sie müssen sich registrieren, um alle Funktionen der App zu nutzen
- Sie müssen eine gültige E-Mail-Adresse angeben
- Sie sind verpflichtet, wahrheitsgemäße Informationen zu liefern
- Nur ein Konto pro Person ist erlaubt

### 3.2 Kontosicherheit
- Sie sind für die Sicherheit Ihres Kontos und Passworts verantwortlich
- Teilen Sie Ihre Anmeldedaten nicht mit Dritten
- Benachrichtigen Sie uns sofort bei unbefugter Nutzung
- Verwenden Sie ein sicheres Passwort

### 3.3 Kontosperrung
- Falsche oder irreführende Informationen können zur Sperrung führen
- Verstöße gegen diese Nutzungsbedingungen führen zur Sperrung
- Wir behalten uns das Recht vor, Konten ohne vorherige Ankündigung zu sperren

## 4. Erlaubte Nutzung

### 4.1 Bestimmungsgemäße Nutzung
- Die App ist ausschließlich zur Verwaltung von CS 2 Skin-Sammlungen bestimmt
- Nutzung für private, nicht-kommerzielle Zwecke
- Einhaltung aller geltenden Gesetze und Vorschriften

### 4.2 Kommerzielle Nutzung
- Kommerzielle Nutzung erfordert unsere ausdrückliche schriftliche Zustimmung
- Unbefugte kommerzielle Nutzung führt zur sofortigen Sperrung
- Direkte kommerzielle Nutzungsanfragen an unseren Support

## 5. Verbotene Aktivitäten

Sie stimmen zu, von folgenden Aktivitäten abzusehen:
- Übertragung von Malware, Viren oder schädlichem Code
- Störung der Plattformfunktionalität oder Server
- Umgehung von Sicherheitsmaßnahmen
- Unbefugter automatisierter Zugriff (Bots, Scraper)
- Verletzung von Drittanbieterrechten
- Spam oder unerwünschte Werbung
- Missbrauch von Bewertungs- oder Kommentarfunktionen
- Nutzung für illegale Zwecke

## 6. Inhalte und geistiges Eigentum

### 6.1 Nutzergenerierte Inhalte
- Sie behalten die Rechte an Ihren hochgeladenen Inhalten (Loadouts, Notizen)
- Durch das Hochladen gewähren Sie uns das Recht, Inhalte zu nutzen, zu speichern und anzuzeigen
- Inhalte müssen legal, angemessen und frei von Rechtsverletzungen sein
- Wir können Inhalte ohne vorherige Ankündigung entfernen

### 6.2 Plattform-Inhalte
- Alle App-Inhalte (Design, Code, Text) sind urheberrechtlich geschützt
- Unbefugte Nutzung oder Reproduktion ist verboten
- Skin-Bilder und Daten stammen aus öffentlich zugänglichen Quellen

## 7. Preise und Marktdaten

### 7.1 Preisinformationen
- Alle Preisinformationen werden als Schätzungen ohne Gewähr bereitgestellt
- Preise können sich schnell ändern
- Wir übernehmen keine Haftung für die Genauigkeit der Preisdaten

### 7.2 Datenquellen
- Daten stammen aus verschiedenen öffentlich zugänglichen Quellen
- Wir überprüfen Daten regelmäßig, können aber keine Vollständigkeit garantieren
- Nutzer sollten Preise unabhängig verifizieren, bevor sie wichtige Entscheidungen treffen

## 8. Verfügbarkeit und Wartung

### 8.1 Verfügbarkeit
- Wir streben eine hohe App-Verfügbarkeit an
- Wartungsarbeiten können zu vorübergehenden Unterbrechungen führen
- Wir informieren über geplante Wartung, wenn möglich

### 8.2 Technische Probleme
- Wir sind nicht haftbar für Ausfälle oder technische Probleme
- Melden Sie Probleme über unsere Support-Kanäle
- Wir bemühen uns um schnelle Problemlösung

## 9. Beendigung der Nutzung

### 9.1 Beendigung durch Nutzer
- Sie können Ihr Konto jederzeit löschen
- Kontaktieren Sie unseren Support oder nutzen Sie die Löschfunktion
- Nach der Löschung werden Ihre Daten gemäß unserer Datenschutzerklärung behandelt

### 9.2 Beendigung durch uns
- Wir können Konten bei Verstößen gegen diese Bedingungen sperren
- Schwere Verstöße können zur sofortigen Sperrung führen
- Sie werden per E-Mail über die Sperrung benachrichtigt

## 10. Haftungsausschluss

### 10.1 Allgemeiner Haftungsausschluss
- Die Nutzung der App erfolgt auf eigene Gefahr
- Wir geben keine Garantie für die Genauigkeit der Daten
- Die Nutzung von Preisdaten für Investitionsentscheidungen erfolgt auf eigene Gefahr

### 10.2 Haftungsbeschränkung
- Wir haften nur für Vorsatz und grobe Fahrlässigkeit
- Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten
- Die Haftung ist auf vorhersehbare Schäden beschränkt
- Wir haften nicht für entgangene Gewinne oder Folgeschäden

## 11. Änderungen der Nutzungsbedingungen

### 11.1 Recht zur Änderung
- Wir können diese Nutzungsbedingungen jederzeit ändern
- Änderungen werden per E-Mail mindestens 30 Tage vor Inkrafttreten mitgeteilt
- Wesentliche Änderungen werden in der App angekündigt

### 11.2 Widerspruchsrecht
- Sie können Änderungen innerhalb von 30 Tagen widersprechen
- Widerspruch führt zur Beendigung der Nutzungsrechte
- Fortgesetzte Nutzung nach Inkrafttreten der Änderungen gilt als Zustimmung

## 12. Datenschutz
Der Schutz Ihrer Daten ist uns wichtig. Details zur Datenverarbeitung finden Sie in unserer Datenschutzerklärung.

## 13. Schlussbestimmungen

### 13.1 Salvatorische Klausel
Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

### 13.2 Anwendbares Recht
Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.

### 13.3 Gerichtsstand
Gerichtsstand für alle Streitigkeiten ist [Ihr Standort/Firmensitz], sofern Sie Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen sind.

---

**Stand:** 16. Juli 2025

**Kontakt für Fragen:**
E-Mail: info@skinvault.app`
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

export default function TermsOfService() {
  const [language, setLanguage] = useState<Language>('en');

  const content = termsContent[language];

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