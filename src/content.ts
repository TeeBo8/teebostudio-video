// Tous les textes de la vidéo, en français et en anglais.
// Règle du site : uniquement des faits vérifiables (prix publics, chiffres des études de cas, témoignage réel, publié sur la fiche Google).

export type Lang = 'fr' | 'en';

export const CONTENT = {
  fr: {
    hello: 'Bonjour',
    name: 'Thibault Leture',
    role: 'Développeur web freelance à Bordeaux',
    servicesLabel: 'Expertises',
    from: 'Dès',
    services: [
      {name: 'Sites web', price: '690 €'},
      {name: 'Visibilité Google & IA', price: '490 €'},
      {name: 'Applications web', price: '4 990 €'},
      {name: 'Intégration IA', price: '490 €'},
    ],
    workLabel: 'Réalisations',
    projects: [
      {title: 'Cabinet Delcros', kind: 'Projet client · Site vitrine', note: ['5 simulateurs', 'de prêt'], image: 'cabinetdelcros-desktop.webp'},
      {title: 'Les Clefs du Crédit', kind: 'Projet client · Site vitrine', note: ['100/100 SEO', 'sur PageSpeed'], image: 'lesclefsducredit.png'},
      {title: 'NeuroBlend', kind: 'Démo · Place de marché', note: ['code public', 'sur GitHub'], image: 'neuroblend-desktop.webp'},
      {title: 'BeeDirectory', kind: 'Produit personnel · SaaS', note: ['7 clients', 'payants'], image: 'beedirectory-desktop.webp'},
    ],
    quoteLabel: 'Témoignage',
    rating: '5,0 sur Google',
    quote: 'Thibault a su créer mon site internet exactement comme je le souhaitais, et même au-delà des espérances.',
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
      {name: 'Websites', price: '€690'},
      {name: 'Google & AI visibility', price: '€490'},
      {name: 'Web applications', price: '€4,990'},
      {name: 'AI integration', price: '€490'},
    ],
    workLabel: 'Work',
    projects: [
      {title: 'Cabinet Delcros', kind: 'Client project · Business website', note: ['5 loan', 'calculators'], image: 'cabinetdelcros-desktop.webp'},
      {title: 'Les Clefs du Crédit', kind: 'Client project · Business website', note: ['100/100 SEO', 'on PageSpeed'], image: 'lesclefsducredit.png'},
      {title: 'NeuroBlend', kind: 'Demo · Marketplace', note: ['public code', 'on GitHub'], image: 'neuroblend-desktop.webp'},
      {title: 'BeeDirectory', kind: 'Personal product · SaaS', note: ['7 paying', 'customers'], image: 'beedirectory-desktop.webp'},
    ],
    quoteLabel: 'Testimonial',
    rating: '5.0 on Google',
    quote: 'Thibault managed to build my website exactly the way I wanted it, and even beyond my expectations.',
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
