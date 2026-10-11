// SOLSTICE — content model. All prices and availability are illustrative.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const SEASONS = {
  winter: { label: 'Dec–Feb', months: [12, 1, 2] },
  spring: { label: 'Mar–May', months: [3, 4, 5] },
  summer: { label: 'Jun–Aug', months: [6, 7, 8] },
  autumn: { label: 'Sep–Nov', months: [9, 10, 11] },
};

export const MOODS = ['Stillness', 'Wild', 'Culture', 'Slow luxury', 'Adventure'];
export const REGIONS = ['Europe', 'Asia', 'Africa & Middle East', 'Americas', 'Oceania'];

// type = landscape profile used for the drawn horizon; light = time of day for the thumbnail (0 dawn … 1 night)
export const DESTINATIONS = [
  {
    id: 'cappadocia', name: 'Cappadocia', country: 'Türkiye', region: 'Asia', lat: 38.64, lon: 34.83,
    type: 'chimneys', light: 0.12, months: [4, 5, 6, 9, 10], moods: ['Culture', 'Adventure'], nights: 5, from: 3800,
    line: 'Balloons lift with the sun over valleys of soft volcanic stone.',
    days: ['Balloon flight at first light', 'Cave-house supper in Göreme', 'Rose Valley walk at dusk'],
  },
  {
    id: 'douro', name: 'Douro Valley', country: 'Portugal', region: 'Europe', lat: 41.16, lon: -7.79,
    type: 'terraces', light: 0.32, months: [4, 5, 6, 9, 10], moods: ['Slow luxury', 'Culture'], nights: 6, from: 3900,
    line: 'Hand-cut schist terraces, a slow river and long lunches in the quintas.',
    days: ['Harvest morning on a terraced quinta', 'Rabelo boat on the river', 'Long lunch in Pinhão'],
  },
  {
    id: 'wadirum', name: 'Wadi Rum', country: 'Jordan', region: 'Africa & Middle East', lat: 29.57, lon: 35.42,
    type: 'mesa', light: 0.5, months: [3, 4, 10, 11], moods: ['Wild', 'Adventure'], nights: 5, from: 3400,
    line: 'Red sand, sandstone towers and a silence you can hear at noon.',
    days: ['Sunrise climb to Burdah rock bridge', 'Camp beneath the Seven Pillars', 'Night walk without torches'],
  },
  {
    id: 'lofoten', name: 'Lofoten', country: 'Norway', region: 'Europe', lat: 68.21, lon: 13.6,
    type: 'fjord', light: 0.74, months: [6, 7, 8], moods: ['Wild', 'Stillness'], nights: 7, from: 5200,
    line: 'Granite peaks straight out of the sea, and a sun that will not set in June.',
    days: ['Midnight-sun paddle to Reine', 'A night in a fisherman’s rorbu', 'Ridge walk above Hamnøy'],
  },
  {
    id: 'atacama', name: 'Atacama', country: 'Chile', region: 'Americas', lat: -22.91, lon: -68.2,
    type: 'saltflat', light: 0.9, months: [3, 4, 5, 9, 10, 11], moods: ['Stillness', 'Wild'], nights: 6, from: 4600,
    line: 'Salt flats that mirror the sky, and some of the clearest nights on Earth.',
    days: ['Salt flats at blue hour', 'Stargazing with a local astronomer', 'Thermal pools at Puritama'],
  },
  {
    id: 'kumano', name: 'Kumano Kodo', country: 'Japan', region: 'Asia', lat: 33.84, lon: 135.77,
    type: 'forest', light: 0.22, months: [3, 4, 5, 10, 11], moods: ['Culture', 'Stillness'], nights: 8, from: 5800,
    line: 'Pilgrim trails through cedar forest, with an onsen at the end of every day.',
    days: ['Walking the Nakahechi trail', 'Onsen night in Yunomine', 'Temple lodging on Mount Kōya'],
  },
  {
    id: 'lanha', name: 'Lan Ha Bay', country: 'Vietnam', region: 'Asia', lat: 20.75, lon: 107.05,
    type: 'karst', light: 0.62, months: [3, 4, 5, 10, 11], moods: ['Slow luxury', 'Adventure'], nights: 5, from: 3200,
    line: 'Limestone towers rising from green water, explored by kayak and wooden junk.',
    days: ['Kayak through hidden lagoons', 'A night at anchor on a junk', 'Morning market on Cat Ba'],
  },
  {
    id: 'sossusvlei', name: 'Sossusvlei', country: 'Namibia', region: 'Africa & Middle East', lat: -24.73, lon: 15.29,
    type: 'dunes', light: 0.08, months: [5, 6, 7, 8, 9], moods: ['Wild', 'Stillness'], nights: 7, from: 6200,
    line: 'Apricot dunes, ancient dead trees and a sky that empties of everything but light.',
    days: ['Dune 45 before sunrise', 'Deadvlei in the morning light', 'Sundowner on the gravel plains'],
  },
  {
    id: 'faroe', name: 'Faroe Islands', country: 'Denmark', region: 'Europe', lat: 62.01, lon: -6.77,
    type: 'cliffs', light: 0.4, months: [5, 6, 7, 8], moods: ['Wild', 'Adventure'], nights: 6, from: 4300,
    line: 'Grass-roofed villages, sheer sea cliffs and weather that changes every hour.',
    days: ['Cliff walk to Gásadalur', 'Boat beneath the Vestmanna cliffs', 'Kitchen-table supper in a farmhouse'],
  },
  {
    id: 'paro', name: 'Paro Valley', country: 'Bhutan', region: 'Asia', lat: 27.43, lon: 89.41,
    type: 'valley', light: 0.28, months: [3, 4, 10, 11], moods: ['Culture', 'Stillness'], nights: 7, from: 6900,
    line: 'Prayer flags, rice terraces and a monastery that clings to the cliff.',
    days: ['The climb to Taktsang', 'Farmhouse hot-stone bath', 'Morning at Rinpung Dzong'],
  },
  {
    id: 'tekapo', name: 'Lake Tekapo', country: 'New Zealand', region: 'Oceania', lat: -44.0, lon: 170.48,
    type: 'lake', light: 0.95, months: [2, 3, 4, 5, 6], moods: ['Stillness', 'Wild'], nights: 6, from: 5100,
    line: 'A turquoise lake under one of the world’s great dark-sky reserves.',
    days: ['Dark-sky evening by the lake', 'Hooker Valley track at Aoraki', 'Lakeshore breakfast at dawn'],
  },
  {
    id: 'oaxaca', name: 'Oaxaca', country: 'Mexico', region: 'Americas', lat: 17.07, lon: -96.73,
    type: 'valley', light: 0.8, months: [10, 11, 12, 1, 2, 3], moods: ['Culture', 'Slow luxury'], nights: 6, from: 3600,
    line: 'Markets, mezcal and weaving villages in a high valley ringed by mountains.',
    days: ['Breakfast at the 20 de Noviembre market', 'A morning at a mezcal palenque', 'Weaving workshop in Teotitlán'],
  },
];

export const byId = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));

// The five hero chapters travel from dawn to night.
export const CHAPTERS = [
  { id: 'cappadocia', no: 'I', phase: 'Dawn', clock: '05:20' },
  { id: 'douro', no: 'II', phase: 'Morning', clock: '08:40' },
  { id: 'wadirum', no: 'III', phase: 'Noon', clock: '12:30' },
  { id: 'lofoten', no: 'IV', phase: 'Golden hour', clock: '18:10' },
  { id: 'atacama', no: 'V', phase: 'Dusk', clock: '21:40' },
];

// Simplified, deliberately geometric land outlines in [lon, lat]. Not to scale; illustrative only.
export const LAND = [
  [[-166,68],[-156,71],[-130,70],[-110,73],[-85,70],[-80,63],[-94,59],[-88,56],[-80,52],[-78,58],[-64,60],[-56,52],[-66,45],[-70,42],[-76,37],[-81,31],[-80,25],[-83,29],[-90,30],[-97,27],[-97,21],[-90,21],[-87,15],[-83,9],[-78,8],[-80,7],[-86,12],[-92,15],[-105,20],[-110,24],[-112,30],[-117,32],[-124,40],[-124,48],[-130,55],[-138,59],[-150,60],[-158,57],[-165,60]],
  [[-78,8],[-72,12],[-62,10],[-52,5],[-50,0],[-35,-6],[-39,-14],[-41,-22],[-48,-26],[-58,-35],[-63,-41],[-68,-50],[-69,-55],[-74,-52],[-73,-42],[-71,-30],[-70,-18],[-76,-14],[-81,-5],[-80,0],[-77,4]],
  [[-9,37],[-9,43],[-2,43.5],[-4,48],[2,51],[5,53],[8,57],[10,54],[14,54],[21,55],[23,60],[21,63],[25,66],[18,69],[24,71],[30,70],[40,67],[44,68],[60,69],[70,73],[80,73],[100,77],[112,74],[130,71],[150,71],[170,70],[180,68],[180,65],[160,60],[150,59],[140,54],[135,43],[129,35],[127,39],[121,40],[122,31],[120,25],[110,21],[108,16],[109,11],[105,9],[103,1],[100,6],[98,16],[94,17],[90,22],[86,20],[80,15],[77,8],[73,17],[72,21],[67,25],[57,26],[56,24],[59,22],[52,16],[44,12],[42,16],[35,28],[34,31],[36,36],[30,36],[27,37],[26,40],[23,40],[23,36],[20,40],[19,42],[13,45],[18,40],[16,38],[12,42],[9,44],[3,43],[-0.5,38],[-5,36]],
  [[-17,21],[-13,28],[-6,36],[10,37],[11,33],[20,31],[32,31],[34,28],[43,12],[51,12],[48,5],[40,-3],[40,-11],[35,-24],[32,-29],[27,-34],[19,-35],[15,-27],[12,-17],[13,-6],[9,-1],[9,4],[3,6],[-8,5],[-13,9],[-17,15]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[136,-16],[142,-11],[146,-19],[153,-26],[151,-34],[145,-39],[138,-35],[132,-32],[124,-34],[115,-34]],
  [[-73,78],[-60,82],[-30,83],[-20,80],[-22,70],[-40,65],[-44,60],[-52,64],[-55,70]],
  [[-5,50],[1,51],[2,53],[-1,55],[-3,58.6],[-5,58],[-6,56],[-3,54],[-5,52]],
  [[-10,52],[-6,52],[-6,55],[-8,55],[-10,54]],
  [[-24,65],[-22,66.5],[-14,66.5],[-13,65],[-18,63.4],[-22,64]],
  [[130,31],[132,34],[136,34],[140,35],[142,39],[141,42],[145,44],[142,45],[139,42],[140,38],[137,37],[133,35.5],[130,33]],
  [[172,-34],[175,-37],[178,-38],[175,-41],[174,-41.5],[172,-41],[168,-46],[167,-45],[171,-42],[174,-39]],
  [[95,5],[98,4],[106,-6],[104,-6]],
  [[109,2],[117,7],[119,1],[116,-4],[110,-3]],
  [[131,-1],[141,-3],[150,-10],[141,-9],[137,-5]],
  [[44,-25],[47,-25],[50,-15],[49,-12],[44,-17]],
];

// Approximate day length (hours) for a latitude and solar declination (degrees). Illustrative.
export function dayLength(lat, decl) {
  const r = Math.PI / 180;
  const x = -Math.tan(lat * r) * Math.tan(decl * r);
  if (x <= -1) return 24;
  if (x >= 1) return 0;
  return (24 / Math.PI) * Math.acos(x);
}

export function fmtHours(h) {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  if (mm === 60) return `${hh + 1}h 00m`;
  return `${hh}h ${String(mm).padStart(2, '0')}m`;
}

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
