export const metaWith = (title: string, description: string) => [
  {
    name: 'description',
    content: description,
  },
  {
    name: 'author',
    content: 'DevWedeloper',
  },
  {
    property: 'og:title',
    content: title,
  },
  {
    property: 'og:site_name',
    content: 'Gemini Clone',
  },
  {
    property: 'og:type',
    content: 'website',
  },
  {
    property: 'og:url',
    content: 'https://gemini-clone-devwedeloper.vercel.app/',
  },
  {
    property: 'og:description',
    content: description,
  },
  {
    property: 'og:image',
    content: 'https://gemini-clone-devwedeloper.vercel.app/favicon.ico',
  },

  {
    property: 'twitter:card',
    content: 'summary_large_image',
  },
  {
    property: 'twitter:title',
    content: title,
  },
  {
    property: 'twitter:description',
    content: description,
  },
  {
    property: 'twitter:image',
    content: 'https://gemini-clone-devwedeloper.vercel.app/favicon.ico',
  },
];
