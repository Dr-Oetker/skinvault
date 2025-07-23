import { useState } from 'react';
import { Link } from 'react-router-dom';

type Language = 'en' | 'de';

const privacyContent = {
  en: {
    title: 'Privacy Policy',
    content: `# Privacy Policy

## 1. Data Protection at a Glance

### General Information
The following information provides a simple overview of what happens to your personal data when you visit our website. Personal data is any data with which you could be personally identified.

### Data Collection on Our Website

**Who is responsible for data collection on this website?**
The data processing on this website is carried out by the website operator. You can find their contact details in the legal notice of this website.

**How do we collect your data?**
Your data is collected on the one hand when you provide it to us. This could be data that you enter in a contact form, for example.

Other data is collected automatically or with your consent when you visit the website by our IT systems. This is mainly technical data (e.g., internet browser, operating system, or time of page view).

**What do we use your data for?**
Some of the data is collected to ensure the proper functioning of the website. Other data can be used to analyze how visitors use the site.

**What rights do you have regarding your data?**
You always have the right to request information about your stored personal data, its origin, its recipients, and the purpose of its collection at no charge. You also have the right to request that it be corrected, blocked, or deleted.

---

## 2. Hosting and Content Delivery Networks (CDN)

### External Hosting
This website is hosted by an external service provider (host). The personal data collected on this website is stored on the host's servers.

### Supabase
We use Supabase as a Backend-as-a-Service platform. The provider is Supabase Inc. with servers in various regions worldwide. Data transmission is encrypted via HTTPS.

**Purpose of processing:**
- Providing website functionality
- Database management
- Authentication and session management
- File storage

**Legal basis:**
Art. 6 para. 1 lit. f GDPR (Legitimate interests)

---

## 3. General Information and Mandatory Information

### Data Protection
The operators of these pages take the protection of your personal data very seriously. We treat your personal data confidentially and in accordance with the statutory data protection regulations and this privacy policy.

### Information about the responsible party
The party responsible for processing data on this website is:

Lennard Klein
Königstr. 76
33098 Paderborn
Germany
info@skinvault.app

The responsible party is the natural or legal person who alone or jointly with others decides on the purposes and means of processing personal data.

### Revocation of your consent to the processing of your data
Many data processing operations are only possible with your express consent. You may revoke your consent at any time with future effect. An informal email making this request is sufficient.

### SSL or TLS encryption
This site uses SSL or TLS encryption for security reasons and for the protection of the transmission of confidential content. You can recognize an encrypted connection in your browser's address line when it changes from "http://" to "https://".

---

## 4. Data Collection on Our Website

### Registration on this Website
You can register on our website to use additional features. We only use the data entered for the purpose of using the respective offer or service for which you have registered.

**Processed data:**
- Email address
- Encrypted password
- Registration date
- Last login

**Legal basis:**
Art. 6 para. 1 lit. b GDPR (Contract fulfillment)

### Data you store in the App
When you use our app, we store the following data:

**Loadouts:**
- Weapon selection and associated skins
- Loadout names and descriptions
- Creation date

**Favorites:**
- Selected skins as favorites
- Addition date

**Resell Tracker:**
- Purchase prices and current values
- Purchase dates and notes
- Skin wear values

**Legal basis:**
Art. 6 para. 1 lit. b GDPR (Contract fulfillment)

### Cookies
Our website uses cookies. These are small text files that your web browser stores on your device. Cookies help us make our offer more user-friendly, effective, and secure.

Some cookies are "session cookies." Such cookies are automatically deleted after your browser session ends. Other cookies remain on your device until you delete them.

**Technically necessary cookies:**
- Session ID for authentication
- Language settings
- Theme preferences

**Legal basis:**
Art. 6 para. 1 lit. f GDPR (Legitimate interests)

---

## 5. Your Rights

### Information, Blocking, Deletion
Within the framework of the applicable statutory provisions, you have the right to obtain information about your stored personal data, their origin and recipient and the purpose of data processing and, if applicable, a right to correction, blocking or deletion of this data.

### Right to Data Portability
You have the right to have data that we process automatically on the basis of your consent or in fulfillment of a contract handed over to you or to a third party in a standard, machine-readable format.

### Right to Restrict Processing
You have the right to request the restriction of the processing of your personal data.

### Right to Object
You have the right to object to the processing of your personal data at any time for reasons arising from your particular situation.

### Complaint to Supervisory Authority
You have the right to lodge a complaint with a supervisory authority if you believe that the processing of your personal data violates the GDPR.

---

## 6. Contact

For questions about data protection or to exercise your rights, please contact:

**Email:** info@skinvault.app
**Postal address:** Königstr. 76, 33098, Paderborn, Germany

---

**Last updated:** July 16, 2025`
  },
  de: {
    title: 'Datenschutzerklärung',
    content: `# Datenschutzerklärung

## 1. Datenschutz auf einen Blick

### Allgemeine Hinweise
Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.

### Datenerfassung auf unserer Website

**Wer ist verantwortlich für die Datenerfassung auf dieser Website?**
Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.

**Wie erfassen wir Ihre Daten?**
Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie bei der Registrierung oder in Kontaktformularen eingeben.

Andere Daten werden automatisch beim Besuch der Website durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B. Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs).

**Wofür nutzen wir Ihre Daten?**
Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.

**Welche Rechte haben Sie bezüglich Ihrer Daten?**
Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.

---

## 2. Hosting und Content Delivery Networks (CDN)

### Externes Hosting
Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.

### Supabase
Wir nutzen Supabase als Backend-as-a-Service-Plattform. Anbieter ist Supabase Inc. mit Servern in verschiedenen Regionen weltweit. Die Datenübertragung erfolgt verschlüsselt über HTTPS.

**Zweck der Verarbeitung:**
- Bereitstellung der Website-Funktionalität
- Datenbankverwaltung
- Authentifizierung und Sitzungsverwaltung
- Dateispeicherung

**Rechtsgrundlage:**
Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen)

---

## 3. Allgemeine Hinweise und Pflichtinformationen

### Datenschutz
Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.

### Hinweis zur verantwortlichen Stelle
Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:

Lennard Klein
Königstr. 76
33098 Paderborn
info@skinvault.app

Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten entscheidet.

### Widerruf Ihrer Einwilligung zur Datenverarbeitung
Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns.

### SSL- bzw. TLS-Verschlüsselung
Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt.

---

## 4. Datenerfassung auf unserer Website

### Registrierung auf dieser Website
Sie können sich auf unserer Website registrieren, um zusätzliche Funktionen der Website zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der Nutzung des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben.

**Verarbeitete Daten:**
- E-Mail-Adresse
- Verschlüsseltes Passwort
- Registrierungsdatum
- Letzte Anmeldung

**Rechtsgrundlage:**
Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)

### Daten, die Sie in der App speichern
Wenn Sie unsere App nutzen, speichern wir folgende Daten:

**Loadouts:**
- Waffenauswahl und zugehörige Skins
- Loadout-Namen und -Beschreibungen
- Erstellungsdatum

**Favoriten:**
- Ausgewählte Skins als Favoriten
- Hinzufügungsdatum

**Resell-Tracker:**
- Kaufpreise und aktuelle Werte
- Kaufdaten und Notizen
- Skin-Verschleißwerte

**Rechtsgrundlage:**
Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)

### Cookies
Unsere Website verwendet Cookies. Das sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.

Einige Cookies sind "Session-Cookies." Solche Cookies werden nach Ende Ihres Browser-Sessions automatisch gelöscht. Andere Cookies verbleiben auf Ihrem Endgerät, bis Sie diese löschen.

**Technisch notwendige Cookies:**
- Session-ID für die Authentifizierung
- Spracheinstellungen
- Theme-Einstellungen

**Rechtsgrundlage:**
Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen)

---

## 5. Ihre Rechte

### Auskunft, Sperrung, Löschung
Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder Sperrung dieser Daten.

### Recht auf Datenübertragbarkeit
Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen, maschinenlesbaren Format aushändigen zu lassen.

### Recht auf Einschränkung der Verarbeitung
Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.

### Widerspruchsrecht
Sie haben das Recht, der Verarbeitung Ihrer personenbezogenen Daten jederzeit aus Gründen, die sich aus Ihrer besonderen Situation ergeben, zu widersprechen.

### Beschwerde bei Aufsichtsbehörde
Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen die DSGVO verstößt.

---

## 6. Kontakt

Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns bitte:

**E-Mail:** info@skinvault.app
**Postanschrift:** Königstr. 76, 33098, Paderborn

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

export default function PrivacyPolicy() {
  const [language, setLanguage] = useState<Language>('en');

  const content = privacyContent[language];

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