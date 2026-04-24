export type GearItem = {
  id: string;
  name: string;
  category: string;
  price: number;     // daily rental USD
  free: boolean;
};

export const gearData: GearItem[] = [
  // Cameras
  { id: 'c1', name: 'ARRI Alexa Mini LF', category: 'Camera', price: 1250, free: false },
  { id: 'c2', name: 'RED Komodo 6K', category: 'Camera', price: 650, free: false },
  { id: 'c3', name: 'Sony FX3', category: 'Camera', price: 450, free: false },
  { id: 'c4', name: 'Blackmagic Pocket 6K Pro', category: 'Camera', price: 295, free: false },
  { id: 'c5', name: 'Canon EOS R5 C', category: 'Camera', price: 350, free: false },
  { id: 'c6', name: 'DJI Ronin 4D-6K', category: 'Camera', price: 899, free: false },

  // Lenses
  { id: 'l1', name: 'ARRI Signature Prime 25mm T1.8', category: 'Lens', price: 450, free: false },
  { id: 'l2', name: 'Zeiss Supreme Prime 50mm T1.5', category: 'Lens', price: 320, free: false },
  { id: 'l3', name: 'Canon CN-E 24-70mm T2.8', category: 'Lens', price: 280, free: false },
  { id: 'l4', name: 'Sigma 18-35mm f/1.8 (EF)', category: 'Lens', price: 95, free: false },
  { id: 'l5', name: 'Rokinon Cine DS 35mm T1.5', category: 'Lens', price: 65, free: false },
  { id: 'l6', name: 'Viltrox 24mm f/1.8 AF (Sony)', category: 'Lens', price: 45, free: false },

  // Lighting
  { id: 'lt1', name: 'ARRI SkyPanel S60-C', category: 'Lighting', price: 295, free: false },
  { id: 'lt2', name: 'Aputure 600d Pro', category: 'Lighting', price: 175, free: false },
  { id: 'lt3', name: 'Godox SL-300W', category: 'Lighting', price: 65, free: false },
  { id: 'lt4', name: 'Nanlite Forza 300B', category: 'Lighting', price: 110, free: false },
  { id: 'lt5', name: 'Westcott Ice Light 2', category: 'Lighting', price: 45, free: false },

  // Audio
  { id: 'a1', name: 'Sennheiser MKH 416 Shotgun', category: 'Audio', price: 95, free: false },
  { id: 'a2', name: 'Rode NTG5', category: 'Audio', price: 55, free: false },
  { id: 'a3', name: 'Zoom H6 Handy Recorder', category: 'Audio', price: 45, free: false },
  { id: 'a4', name: 'Deity TC-1 Timecode Slate', category: 'Audio', price: 35, free: false },
  { id: 'a5', name: 'Sennheiser G4 Wireless (2ch)', category: 'Audio', price: 125, free: false },

  // Grip & Support
  { id: 'g1', name: 'Dana Dolly Kit', category: 'Grip', price: 175, free: false },
  { id: 'g2', name: 'Manfrotto 504X Tripod', category: 'Grip', price: 85, free: false },
  { id: 'g3', name: 'DJI Ronin RS 3 Pro', category: 'Grip', price: 125, free: false },
  { id: 'g4', name: 'Matthews C-Stand (x2)', category: 'Grip', price: 65, free: false },
  { id: 'g5', name: 'EasyRig Vario 5', category: 'Grip', price: 95, free: false },

  // Monitoring
  { id: 'm1', name: 'SmallHD 702 Touch', category: 'Monitoring', price: 175, free: false },
  { id: 'm2', name: 'Atomos Ninja V+', category: 'Monitoring', price: 95, free: false },
  { id: 'm3', name: 'Blackmagic Video Assist 7"', category: 'Monitoring', price: 85, free: false },

  // Free / Software / Owned
  { id: 'f1', name: 'DaVinci Resolve Studio', category: 'Software', price: 0, free: true },
  { id: 'f2', name: 'Blackmagic Camera App', category: 'Software', price: 0, free: true },
  { id: 'f3', name: 'Adobe Premiere Pro (trial)', category: 'Software', price: 0, free: true },
  { id: 'f4', name: '35mm Film Stock Simulator (web)', category: 'Software', price: 0, free: true },
  { id: 'f5', name: 'Your own iPhone 15 Pro', category: 'Camera', price: 0, free: true },
  { id: 'f6', name: 'Rode Wireless GO II (personal)', category: 'Audio', price: 0, free: true },
];