import type { Profile } from './profile';

export const CARD_WIDTH = 818;
export const CARD_HEIGHT = 542;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load card asset: ${src}`));
    image.src = src;
  });
}

/** One drawing source for both the live 3D texture and the WebGL fallback. */
export async function drawProfileCard(profile: Profile) {
  const [portrait, background, heading] = await Promise.all([
    loadImage(profile.portrait), loadImage(profile.background), loadImage('/about/backgrounds-features.svg'),
    document.fonts.load('500 20px "Card Inter"'),
    document.fonts.load('700 60px "Card Inter"'),
    document.fonts.load('800 36px "Card Inter"'),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH * 2;
  canvas.height = CARD_HEIGHT * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is unavailable');
  ctx.scale(2, 2);
  ctx.fillStyle = '#f6f4ec';
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, CARD_WIDTH, 86);
  ctx.globalAlpha = 0.35;
  ctx.drawImage(background, 282, -3, 547, 547);
  ctx.globalAlpha = 1;
  ctx.textBaseline = 'top';
  const text = (value: string, x: number, y: number, size: number, weight = 500, color = '#222', maxWidth = 430) => {
    ctx.font = `${weight} ${size}px "Card Inter", sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y, maxWidth);
  };
  text(profile.handle, 25, 14, 60, 700, '#f7f7f0', 326);
  profile.tagline.forEach((line, index) => text(line, 366, 19 + index * 28, 23, 700, '#f7f7f0', 438));
  // Match the source's portrait crop without stretching a changed photo.
  const scale = Math.max(300 / portrait.width, 400 / portrait.height);
  const sw = 300 / scale;
  const sh = 400 / scale;
  ctx.drawImage(portrait, (portrait.width - sw) / 2, (portrait.height - sh) / 2, sw, sh, 43, 118, 300, 400);
  text(profile.name, 366, 113, 36, 800);
  text(profile.education, 368, 153, 20);
  [['Date of Birth:', profile.birthDate], ['Nationality:', profile.nationality], ['Role:', profile.role]].forEach(([label, value], index) => {
    text(label, 366, 180 + index * 67, 36, 800);
    text(value, 368, 220 + index * 67, 20);
  });
  ctx.drawImage(heading, 368, 383, 350, 25);
  const paragraphs = [...profile.biography];
  if (profile.researchDirections.length) paragraphs.unshift(`Research: ${profile.researchDirections.join(' / ')}`);
  // Fit longer edits into the same card area; the HTML transcript has no limit.
  const wrap = (size: number) => {
    ctx.font = `500 ${size}px "Card Inter", sans-serif`;
    const lines: string[] = [];
    for (const paragraph of paragraphs) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > 350) { lines.push(line); line = word; } else line = next;
      }
      lines.push(line);
    }
    return lines;
  };
  let fontSize = 10;
  let lines = wrap(fontSize);
  while (lines.length * fontSize * 1.2 > 104 && fontSize > 6) { fontSize -= 0.25; lines = wrap(fontSize); }
  lines.forEach((line, index) => text(line, 368, 411 + index * fontSize * 1.2, fontSize, 500, '#222', 350));
  ctx.strokeStyle = '#62625c';
  ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(363, 176); ctx.lineTo(818, 176); ctx.stroke();
  for (const x of [741, 745]) {
    ctx.lineWidth = x === 741 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(x, 86); ctx.lineTo(x, 542); ctx.stroke();
  }
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(772, 501, 12.5, 0, Math.PI * 2); ctx.fill();
  return canvas;
}
