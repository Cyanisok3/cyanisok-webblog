export type Photograph = {
  id: string;
  title: string;
  monoSrc: string;
  colorSrc: string;
  monoSize: { width: number; height: number };
  colorSize: { width: number; height: number };
  alt: string;
};

function photograph(
  id: string,
  title: string,
  alt: string,
  monoWidth: number,
  monoHeight: number,
  colorWidth: number,
  colorHeight: number,
): Photograph {
  return {
    id, title, alt,
    monoSrc: `/resources/monochrome/${id}.webp`,
    colorSrc: `/resources/full-color/${id}.webp`,
    monoSize: { width: monoWidth, height: monoHeight },
    colorSize: { width: colorWidth, height: colorHeight },
  };
}

export const photographs: Photograph[] = [
  photograph('zibo', 'Zibo', 'Wheat stems overlapping in a field in Zibo', 2560, 1707, 3402, 2268),
  photograph('shanghai', 'Shanghai', 'Blurred towers and lights above the Shanghai waterfront', 2560, 1707, 3402, 2268),
  photograph('hainan', 'Hainan', 'Waves breaking into streaks of light along the shore in Hainan', 2560, 1707, 4036, 2690),
  photograph('yantai', 'Yantai', 'People gathered on a rooftop overlooking Yantai', 2560, 1707, 3402, 2268),
  photograph('ningbo', 'Ningbo', 'A quiet horizon over water in Ningbo', 2560, 1707, 3402, 2268),
  photograph('unnc', 'UNNC', 'Sunlight falling through grass at UNNC', 1766, 1178, 1766, 1178),
  photograph('aquarium', 'Aquarium', 'Jellyfish drifting through an illuminated aquarium', 3402, 2268, 3402, 2268),
];

const heroOrder = ['zibo', 'hainan', 'aquarium', 'shanghai', 'yantai', 'ningbo', 'unnc'];
export const heroPhotographs = heroOrder.map((id) => photographs.find((photo) => photo.id === id)!);
