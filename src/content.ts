// Tous les textes de la vidéo, en français et en anglais.
// Règle du site : uniquement des faits vérifiables (prix publics, chiffres des études de cas, témoignage réel).

export type Lang = 'fr' | 'en';

export const CONTENT = {
  fr: {
    hello: 'Bonjour',
    name: 'Thibault Leture',
    role: 'Développeur web freelance à Bordeaux',
    servicesLabel: 'Expertises',
    from: 'Dès',
    services: [
      {name: 'Sites web', price: '300 €'},
      {name: 'Applications web', price: '2 990 €'},
      {name: 'Intégration IA', price: '490 €'},
      {name: 'Vidéo motion design', price: '290 €'},
    ],
    workLabel: 'Réalisations',
    projects: [
      {title: 'Cabinet Delcros', kind: 'Projet client · Site vitrine', note: ['5 simulateurs', 'de prêt'], image: 'cabinetdelcros-desktop.webp'},
      {title: 'Les Clefs du Crédit', kind: 'Projet client · Site vitrine', note: ['100/100 SEO', 'sur PageSpeed'], image: 'lesclefsducredit.png'},
      {title: 'NeuroBlend', kind: 'Démo · Place de marché', note: ['code public', 'sur GitHub'], image: 'neuroblend-desktop.webp'},
      {title: 'BeeDirectory', kind: 'Produit personnel · SaaS', note: ['7 clients', 'payants'], image: 'beedirectory-desktop.webp'},
    ],
    quoteLabel: 'Témoignage',
    quote: 'Le site est moderne, rapide et exactement ce qu’il nous fallait pour développer notre activité.',
    quoteOpen: '« ',
    quoteClose: ' »',
    quoteAuthor: 'Christopher Tassin',
    quoteRole: 'Gérant, Les Clefs du Crédit',
    promisesLabel: 'Engagements',
    promises: ['Prix fixé avant de commencer', 'Code et comptes à votre nom', 'Réponse sous 24 h'],
    member: 'Membre du programme Claude Startups',
    cta: 'Discutons de votre projet',
  },
  en: {
    hello: 'Hello',
    name: 'Thibault Leture',
    role: 'Freelance web developer in Bordeaux, France',
    servicesLabel: 'Services',
    from: 'From',
    services: [
      {name: 'Websites', price: '€300'},
      {name: 'Web applications', price: '€2,990'},
      {name: 'AI integration', price: '€490'},
      {name: 'Motion design video', price: '€290'},
    ],
    workLabel: 'Work',
    projects: [
      {title: 'Cabinet Delcros', kind: 'Client project · Business website', note: ['5 loan', 'calculators'], image: 'cabinetdelcros-desktop.webp'},
      {title: 'Les Clefs du Crédit', kind: 'Client project · Business website', note: ['100/100 SEO', 'on PageSpeed'], image: 'lesclefsducredit.png'},
      {title: 'NeuroBlend', kind: 'Demo · Marketplace', note: ['public code', 'on GitHub'], image: 'neuroblend-desktop.webp'},
      {title: 'BeeDirectory', kind: 'Personal product · SaaS', note: ['7 paying', 'customers'], image: 'beedirectory-desktop.webp'},
    ],
    quoteLabel: 'Testimonial',
    quote: 'The site is modern, fast and exactly what we needed to grow our business.',
    quoteOpen: '“',
    quoteClose: '”',
    quoteAuthor: 'Christopher Tassin',
    quoteRole: 'Owner, Les Clefs du Crédit · translated from French',
    promisesLabel: 'Commitments',
    promises: ['Price fixed before we start', 'Code and accounts in your name', 'Reply within 24 hours'],
    member: 'Member of the Claude Startups program',
    cta: 'Let’s talk about your project',
  },
};

export type Content = (typeof CONTENT)[Lang];
