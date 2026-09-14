// Card copy transcribed from the user's About Figma. Optional research fields
// stay empty until supplied; links reuse the site's existing public destinations.
export const profile = {
  name: 'QINGYANG LIU',
  handle: 'CYANISOK',
  education: 'UNNC, BSc (Hons) CSAI',
  birthDate: 'Oct. 17, 2004',
  nationality: 'China',
  role: 'UG-Y4 Student',
  tagline: ['CREATE YOUR ART NOW', 'INSPIRE SOULS OFFER KINDNESS'],
  portrait: '/me.png',
  background: '/shanghai.png',
  researchDirections: [] as string[],
  biography: [
    'Do you know?',
    'Soothing music makes me think: you will experience countless things throughout your life. Along the way, thousands of ideas and mindsets will wash over your mind. Some you may deeply agree with, worthy of letting them stay for a while. Yet what matters most is the way you navigate through it all.',
    'What I mean is, no matter what you once believed in, what you held as your creed, or which traits you cast aside, you remain a fluid being.',
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/Cyanisok3' },
    { label: 'Instagram', href: 'https://www.instagram.com/cyanisok_/' },
  ],
};

export type Profile = typeof profile;
