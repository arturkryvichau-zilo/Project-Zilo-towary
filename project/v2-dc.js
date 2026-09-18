const SLOT_MIN = 15;
const WEEK = ['2026-08-10','2026-08-11','2026-08-12','2026-08-13','2026-08-14','2026-08-15','2026-08-16'];
const WD = ['pon','wt','śr','czw','pt','sob','ndz'];
const TODAY = '2026-08-13';

const WS = [
  { id: 'w1', title: 'Mechanika ogólna', color: 'var(--tk-ok-soft)', border: 'var(--tk-ok)', text: 'var(--tk-ok-fg)' },
  { id: 'w2', title: 'Serwis klimatyzacji', color: 'var(--tk-cyan-soft)', border: 'var(--tk-cyan)', text: 'var(--tk-cyan-fg)' },
  { id: 'w3', title: 'Opony i wulkanizacja', color: 'var(--tk-info-soft)', border: 'var(--tk-info)', text: 'var(--tk-info-fg)' },
  { id: 'w4', title: 'Myjnia', color: 'var(--tk-violet-soft)', border: 'var(--tk-violet)', text: 'var(--tk-violet-fg)' },
];

const ST = {
  nowa: { id: 'nowa', name: 'Umówione', order: 0, dot: 'var(--tk-warn)', bg: 'var(--tk-warn-soft)', color: 'var(--tk-warn-fg)' },
  trakcie: { id: 'trakcie', name: 'W trakcie', order: 1, dot: 'var(--tk-info)', bg: 'var(--tk-info-soft)', color: 'var(--tk-info-fg)' },
  naprawione: { id: 'naprawione', name: 'Zakończone', order: 2, dot: 'var(--tk-ok)', bg: 'var(--tk-ok-soft)', color: 'var(--tk-ok-fg)' },
  wydane: { id: 'wydane', name: 'Wydane', order: 3, dot: 'var(--tk-text-3)', bg: 'var(--tk-surface-3)', color: 'var(--tk-text-2)' },
  anulowane: { id: 'anulowane', name: 'Odwołane', order: 4, dot: 'var(--tk-danger)', bg: 'var(--tk-danger-soft)', color: 'var(--tk-danger-fg)' },
};

const EVENTS = [
  { id: 'r32', ws: 'w3', d: 3, t: '08:00', dur: 60, brand: 'BMW', model: '320d E90', plate: 'KR 5588T', reason: 'Wymiana opon', st: 'trakcie', client: 'Tomasz Nowak', phone: '604 771 118', veh: { year: '2010', engine: '2.0 d 177 KM', vin: 'WBAVC91050K118330' } },
  { id: 'r30', ws: 'w1', d: 3, t: '10:00', dur: 60, brand: 'Volkswagen', model: 'Passat B8', plate: 'W7203S', reason: 'Wymiana oleju z filtrem', st: 'nowa', client: 'Marek Zieliński', phone: '601 233 981', veh: { year: '2020', engine: '2.0 TDI', vin: 'WVWZZZ3CZLE045128' } },
];


const TIRE_SIZES = [ '175/65 R14', '185/60 R15', '195/65 R15', '205/55 R16', '205/60 R16', '215/55 R17', '215/60 R16', '225/45 R17', '225/45 R18', '225/50 R17', '235/45 R18', '245/40 R18', '245/45 R19', '255/40 R19', '265/35 R19', '275/35 R18'];

const seasonPrefix = (season) => (season === 'Lato' ? 'L' : (season === 'Całoroczne' ? 'C' : 'Z'));

// ikonka sezonu: płatek (zima), słońce (lato), szary płatek (całoroczne)
const SEASON_ICONS = {
  Zima: { icon: 'assets/icons/season-snowflake.svg', color: 'var(--tk-season-winter)' },
  Lato: { icon: 'assets/icons/season-sun.svg', color: 'var(--tk-season-summer)' },
  'Całoroczne': { icon: 'assets/icons/season-snowflake.svg', color: 'var(--tk-season-all)' },
};
const seasonIcon = (season) => SEASON_ICONS[season] || null;
// KSeF: „Zapisz" zostawia fakturę w kolejce, „Zapisz i wyślij" oznacza ją jako wysłaną
const KSEF_STATUSES = ['Do wysyłki', 'Wysłano', 'W trakcie', 'Błąd wysyłki', 'Brak połączenia', 'Nie dotyczy'];
const KSEF_TONE = {
  'Do wysyłki': { bg: 'var(--tk-surface-3)', color: 'var(--tk-text-2)' },
  'Wysłano': { bg: 'var(--tk-ok-soft)', color: 'var(--tk-ok-fg)' },
  'W trakcie': { bg: 'var(--tk-brand-soft)', color: 'var(--tk-brand-fg)' },
  'Błąd wysyłki': { bg: 'var(--tk-danger-soft)', color: 'var(--tk-danger-fg)' },
  'Brak połączenia': { bg: 'var(--tk-warn-soft)', color: 'var(--tk-warn-fg)' },
  'Nie dotyczy': { bg: 'transparent', color: 'var(--tk-text-3)' },
};
const ksefTone = (label) => KSEF_TONE[label] || KSEF_TONE['Do wysyłki'];

const seasonBits = (season) => {
  const m = seasonIcon(season);
  return { hasIcon: !!m, icon: m ? m.icon : '', iconColor: m ? m.color : 'transparent' };
};
const seasonVals = (season, pref) => {
  const m = seasonIcon(season);
  const k = pref || 'season';
  const o = {};
  o[k + 'HasIcon'] = !!m;
  o[k + 'Icon'] = m ? m.icon : '';
  o[k + 'IconColor'] = m ? m.color : 'transparent';
  return o;
};

const CODE_SEQ = { Z: 6, L: 3, C: 0 };

const seasonCode = (season) => {
  const p = seasonPrefix(season);
  CODE_SEQ[p] += 1;
  return p + String(CODE_SEQ[p]).padStart(4, '0');
};

const TIRE_MAKERS = ['Barum', 'Bridgestone', 'Continental', 'Dębica', 'Dunlop', 'Firestone', 'Fulda', 'Goodyear', 'Hankook', 'Kleber', 'Kormoran', 'Michelin', 'Nokian', 'Pirelli', 'Sava', 'Yokohama'];

const W4 = (maker, size, rim, tread) => [
  { pos: 'Lewy przód', maker, size, rim, tread },
  { pos: 'Prawy przód', maker, size, rim, tread },
  { pos: 'Lewy tył', maker, size, rim, tread },
  { pos: 'Prawy tył', maker, size, rim, tread },
];

const TIRE_SETS = {
  c1a: [
    { season: 'Zima', code: 'Z0001', location: '233 Góra. Półka po lewej stronie', received: '14.07.2026', status: 'in',
      note: 'Felga lewy przód lekko otarta przy przyjęciu — udokumentowane zdjęciem.', files: ['photo', 'photo', 'doc'], wheels: [
        { pos: 'Lewy przód', maker: 'Continental', size: '245/40 R18', rim: 'Tak', tread: '6,0 mm' },
        { pos: 'Prawy przód', maker: 'Continental', size: '245/40 R18', rim: 'Tak', tread: '6,0 mm' },
        { pos: 'Lewy tył', maker: 'Michelin', size: '275/35 R18', rim: 'Tak', tread: '5,5 mm' },
        { pos: 'Prawy tył', maker: 'Michelin', size: '275/35 R18', rim: 'Tak', tread: '5,5 mm' },
      ] },
    { season: 'Lato', code: 'L0001', location: '', received: '15.04.2025', released: '12.04.2026', status: 'out',
      note: '', files: ['photo'], wheels: [
        { pos: 'Wszystkie 4', maker: 'Michelin', size: '225/45 R18', rim: 'Tak', tread: '7,0 mm' },
      ] },
  ],
  c4a: [
    { season: 'Zima', code: 'Z0004', location: '117 DÓŁ, regał 3', received: '18.03.2026', status: 'in',
      note: '', files: [], wheels: [
        { pos: '', maker: 'Continental', size: '225/50 R17', rim: 'Nie', tread: '7,0 mm', qty: '4' },
      ] },
  ],
  c7a: [
    { season: 'Zima', code: 'Z0003', location: '', received: '18.03.2026', status: 'in',
      note: '204 GÓRA', files: [], wheels: [
        { pos: '', maker: 'Nokian', size: '195/65 R15', rim: 'Tak', tread: '6,5 mm', qty: '4' },
      ] },
    { season: 'Lato', code: 'L0002', location: '', received: '21.10.2025', released: '18.03.2026', status: 'out',
      note: '', files: [], wheels: [
        { pos: '', maker: 'Dębica', size: '195/65 R15', rim: 'Nie', tread: '4,0 mm', qty: '4' },
      ] },
  ],
};

const TIRES = {
  c1a: { season: 'Zima', code: 'Z0001', location: '233 Góra. Półka po lewej stronie', received: '14.07.2026', wheels: [
    { pos: 'Lewy przód', maker: 'Continental', size: '245/40 R18', rim: 'Tak', tread: '6,0 mm' },
    { pos: 'Prawy przód', maker: 'Continental', size: '245/40 R18', rim: 'Tak', tread: '6,0 mm' },
    { pos: 'Lewy tył', maker: 'Michelin', size: '275/35 R18', rim: 'Tak', tread: '5,5 mm' },
    { pos: 'Prawy tył', maker: 'Michelin', size: '275/35 R18', rim: 'Tak', tread: '5,5 mm' },
  ] },
  c4a: { season: 'Zima', code: 'Z0004', location: '044 A', received: '03.08.2026', wheels: [
    { pos: 'Wszystkie 4', maker: 'Dębica', size: '195/65 R15', rim: 'Nie', tread: '5,0 mm' },
  ] },
  c9a: { season: 'Lato', code: 'L0003', location: '210 GÓRA', received: '21.04.2026', wheels: W4('Michelin', '225/45 R17', 'Tak', '4,0 mm') },
  c12a: { season: 'Zima', code: 'Z0005', location: '118 DÓŁ', received: '05.05.2026', wheels: [
    { pos: 'Wszystkie 4', maker: 'Goodyear', size: '215/55 R17', rim: 'Tak', tread: '6,5 mm' },
  ] },
  c13a: { season: 'Zima', code: 'Z0006', location: '072 B', received: '21.03.2026', wheels: W4('Nokian', '185/65 R15', 'Nie', '7,0 mm') },
};

const CLIENTS = [
  { id: 'c1', name: 'Marek Zieliński', phone: '601 233 981', email: 'm.zielinski@gmail.com', sms: true, mail: true, opinion: false, cars: [
    { id: 'c1a', brand: 'Skoda', model: 'Octavia III', plate: 'WE 4821K', vin: 'TMBJJ7NE0F0123456', year: '2015', engine: '1.6 TDI 105 KM', last: '10.08.2026', visits: [
      { id: 'r1', date: '10.08.2026', service: 'Wymiana opon + wyważanie', st: 'wydane', price: '320' },
      { id: 'v2', date: '14.03.2026', service: 'Przegląd okresowy', st: 'wydane', price: '480' },
      { id: 'v3', date: '02.11.2025', service: 'Wymiana klocków przód', st: 'wydane', price: '640' } ] },
    { id: 'c1c', brand: 'Volkswagen', model: 'Passat B8', plate: 'W7203S', vin: 'WVWZZZ3CZLE045128', year: '2020', engine: '2.0 TDI', last: '13.08.2026', visits: [
      { id: 'r30', date: '13.08.2026', service: 'Wymiana oleju z filtrem', st: 'nowa', price: '999' } ] },
    { id: 'c1b', brand: 'Toyota', model: 'Avensis', plate: 'WE 1180T', vin: '', year: '2011', engine: '2.0 D-4D', last: '18.05.2026', visits: [
      { id: 'v4', date: '18.05.2026', service: 'Wymiana oleju', st: 'wydane', price: '260' } ] } ] },
  { id: 'c4', name: 'Tomasz Nowak', phone: '604 771 118', email: 't.nowak@onet.pl', sms: true, mail: true, opinion: true, cars: [
    { id: 'c4a', brand: 'BMW', model: '320d E90', plate: 'KR 5588T', vin: 'WBAVC91050K118330', year: '2010', engine: '2.0 d 177 KM', last: '10.08.2026', visits: [
      { id: 'r4', date: '10.08.2026', service: 'Diagnostyka komputerowa', st: 'naprawione', price: '180' },
      { id: 'v10', date: '11.06.2026', service: 'Wymiana rozrządu', st: 'wydane', price: '2450' },
      { id: 'v11', date: '03.04.2026', service: 'Wymiana opon', st: 'anulowane', price: '' },
      { id: 'r32', date: '13.08.2026', service: 'Wymiana opon', st: 'trakcie', price: '320' } ] } ] },
  { id: 'c5', name: 'Ewa Malinowska', phone: '607 003 442', email: 'ewa.mal@gmail.com', sms: true, mail: false, opinion: false, cars: [
    { id: 'c5a', brand: 'Ford', model: 'Focus MK3', plate: 'GD 3391M', vin: 'WF05XXGCC5EU11822', year: '2014', engine: '1.6 TDCi', last: '10.08.2026', visits: [
      { id: 'r5', date: '10.08.2026', service: 'Wymiana klocków i tarcz', st: 'wydane', price: '890' } ] } ] },
  { id: 'c6', name: 'Robert Lis', phone: '660 442 019', email: 'r.lis@firma.pl', sms: false, mail: true, opinion: false, cars: [
    { id: 'c6a', brand: 'Audi', model: 'A4 B8', plate: 'WB 8123R', vin: 'WAUZZZ8K0BA118990', year: '2011', engine: '2.0 TDI 143 KM', last: '11.08.2026', visits: [
      { id: 'r7', date: '11.08.2026', service: 'Wymiana rozrządu', st: 'trakcie', price: '2800' },
      { id: 'v14', date: '22.12.2025', service: 'Wymiana pompy wody', st: 'wydane', price: '760' } ] } ] },
  { id: 'c7', name: 'Julia Bąk', phone: '698 220 771', email: 'julia.bak@gmail.com', sms: true, mail: true, opinion: true, cars: [
    { id: 'c7a', brand: 'Renault', model: 'Clio IV', plate: 'SC 1180P', vin: 'VF15R0J0H54118002', year: '2017', engine: '0.9 TCe', last: '11.08.2026', visits: [
      { id: 'r8', date: '11.08.2026', service: 'Wymiana oleju i filtrów', st: 'naprawione', price: '340' } ] } ] },
  { id: 'c8', name: 'Adam Górski', phone: '605 118 993', email: '', sms: false, mail: false, opinion: true, cars: [
    { id: 'c8a', brand: 'Mercedes', model: 'C220 W205', plate: 'WW 6600S', vin: 'WDD2050141A118776', year: '2019', engine: '2.0 d 194 KM', last: '11.08.2026', visits: [
      { id: 'r9', date: '11.08.2026', service: 'Błąd czujnika ciśnienia', st: 'trakcie', price: '' } ] } ] },
  { id: 'c9', name: 'Karol Mróz', phone: '601 449 202', email: 'k.mroz@interia.pl', sms: true, mail: false, opinion: false, cars: [
    { id: 'c9a', brand: 'Volvo', model: 'V40', plate: 'WE 1204X', vin: 'YV1MV7431F1118220', year: '2015', engine: '2.0 D2', last: '12.08.2026', visits: [
      { id: 'r11', date: '12.08.2026', service: 'Wymiana amortyzatorów', st: 'trakcie', price: '1780' } ] } ] },
  { id: 'c10', name: 'Beata Wrona', phone: '694 003 118', email: 'b.wrona@gmail.com', sms: true, mail: true, opinion: false, cars: [
    { id: 'c10a', brand: 'Hyundai', model: 'i30', plate: 'LU 7788K', vin: '', year: '2020', engine: '1.0 T-GDI', last: '12.08.2026', visits: [
      { id: 'r12', date: '12.08.2026', service: 'Przegląd przed sezonem', st: 'naprawione', price: '420' } ] } ] },
  { id: 'c11', name: 'Sebastian Rak', phone: '507 116 449', email: '', sms: false, mail: false, opinion: false, cars: [
    { id: 'c11a', brand: 'Fiat', model: 'Tipo', plate: 'WA 5510J', vin: 'ZFA35600006118440', year: '2019', engine: '1.4 T-Jet', last: '12.08.2026', visits: [
      { id: 'r13', date: '12.08.2026', service: 'Wymiana opon', st: 'trakcie', price: '260' } ] } ] },
  { id: 'c12', name: 'Grzegorz Pawlak', phone: '602 118 774', email: 'g.pawlak@gmail.com', sms: true, mail: true, opinion: true, cars: [
    { id: 'c12a', brand: 'Skoda', model: 'Superb III', plate: 'WE 2288V', vin: 'TMBJG9NP7H7118221', year: '2017', engine: '2.0 TDI 150 KM', last: '05.05.2026', visits: [
      { id: 'v22', date: '05.05.2026', service: 'Wymiana opon', st: 'wydane', price: '300' } ] } ] },
  { id: 'c13', name: 'Halina Adamczyk', phone: '605 447 210', email: 'h.adamczyk@gmail.com', sms: true, mail: false, opinion: true, cars: [
    { id: 'c13a', brand: 'Skoda', model: 'Fabia III', plate: 'WE 6104P', vin: 'TMBEH6NJ0HZ118004', year: '2017', engine: '1.0 TSI 95 KM', last: '13.08.2026', visits: [
      { id: 'r29', date: '13.08.2026', service: 'Wymiana opon', st: 'nowa', price: '280' },
      { id: 'v30', date: '21.03.2026', service: 'Wymiana opon + przechowanie', st: 'wydane', price: '340' } ] } ] },
];

// Klienci firmowi — dane na fakturę podstawione domyślnie.
const inv = (nip, company, street, zip, city) => ({
  on: true, expanded: false,
  nip: nip, nipBlurred: false, fetched: true,
  company: company, street: street, zip: zip, city: city,
});

const DEFAULT_INVOICES = {
  c1:  inv('552 325 05 93', 'Zieliński Transport Sp. z o.o.', 'ul. Ignacego Dobrogojskiego 30A', '61-692', 'Poznań'),
  c4:  inv('781 204 66 18', 'Nowak Logistyka Sp. z o.o.', 'ul. Szwajcarska 14', '61-285', 'Poznań'),
  c6:  inv('972 116 40 75', 'Lis Serwis Sp. z o.o.', 'ul. Głogowska 218', '60-104', 'Poznań'),
  c9:  inv('783 170 92 34', 'Mróz Fleet Sp. z o.o.', 'ul. Obornicka 235', '60-650', 'Poznań'),
  c12: inv('778 142 55 09', 'Pawlak Instalacje Sp. z o.o.', 'ul. Warszawska 143', '61-047', 'Poznań'),
};

const NOTES = {
  r30: 'Wymiana oleju i filtra przy przebiegu 142 000 km. Klient prosi o olej Castrol — ten sam co przy poprzedniej wymianie.',
  r32: 'Komplet zimowy klienta z przechowalni — do sprawdzenia stan bieżnika przy zakładaniu.',
  r29: 'Wymiana opon z felgami — komplet zimowy klienta przechowywany w warsztacie. Do sprawdzenia stan bieżnika przy oddaniu.',
  r7: 'Wymiana rozrządu wraz z pompą wody. Klient prosi o kontakt telefoniczny przed dokupieniem części.',
};

const DOC_SEED = [
  { nr: 'ZM/2026/0217', ext: 'FV 74980/08/2026', supplier: 'Inter Cars', date: '13.08.2026', status: 'W trakcie', rows: [
    { name: 'Wycieraczki przód (komplet)', code: 'AP24U', producer: 'Bosch', unit: 'Komplet', qty: '1', price: '96,00', vat: '23', msrp: '149,00' },
    { name: 'Filtr oleju', code: 'W 712/95', producer: 'MANN', unit: 'Sztuka', qty: '2', price: '24,00', vat: '23', msrp: '39,00' },
  ] },
  { nr: 'ZM/2026/0216', ext: 'WZ 5610/08/2026', supplier: 'Auto Partner', date: '13.08.2026', status: 'W trakcie', rows: [
    { name: 'Filtr kabinowy węglowy', code: 'CUK 2939', producer: 'MANN', unit: 'Sztuka', qty: '2', price: '64,00', vat: '23', msrp: '98,00' },
    { name: 'Żarówka H7 55W', code: 'H7 STD', producer: 'Osram', unit: 'Sztuka', qty: '4', price: '18,00', vat: '23', msrp: '29,00' },
    { name: 'Uszczelka korka spustu oleju', code: 'N 013 849 2', producer: 'Elring', unit: 'Sztuka', qty: '3', price: '14,00', vat: '23', msrp: '' },
  ] },
  { nr: 'ZM/2026/0215', ext: 'FV 74655/08/2026', supplier: 'Gordon', date: '12.08.2026', status: 'Dostarczony', rows: [
    { name: 'Akumulator 74Ah 680A', code: 'S4 008', producer: 'Bosch', unit: 'Sztuka', qty: '1', price: '398,00', vat: '23', msrp: '549,00' },
  ] },
  { nr: 'ZM/2026/0214', ext: 'WZ 5580/08/2026', supplier: 'Elit Polska', date: '12.08.2026', status: 'Dostarczony', rows: [
    { name: 'Tarcze hamulcowe tył', code: '24.0110-0245.1', producer: 'ATE', unit: 'Sztuka', qty: '2', price: '132,00', vat: '23', msrp: '199,00' },
    { name: 'Klocki hamulcowe tył', code: 'GDB1621', producer: 'TRW', unit: 'Komplet', qty: '1', price: '158,00', vat: '23', msrp: '239,00' },
  ] },
  { nr: 'ZM/2026/0213', ext: 'FV 74221/08/2026', supplier: 'Auto Partner', date: '12.08.2026', status: 'W trakcie', rows: [
    { name: 'Klocki hamulcowe przód', code: 'GDB1330', producer: 'TRW', unit: 'Sztuka', qty: '1', price: '184,00', vat: '23', msrp: '289,00' },
    { name: 'Tarcze hamulcowe przód', code: '24.0122-0187.1', producer: 'ATE', unit: 'Sztuka', qty: '2', price: '146,00', vat: '23', msrp: '219,00' },
    { name: 'Filtr oleju', code: 'HU 7020 z', producer: 'MANN', unit: 'Sztuka', qty: '1', price: '38,00', vat: '23', msrp: '' },
    { name: 'Olej silnikowy 5W30 5L', code: 'EDGE 5W30 LL', producer: 'Castrol', unit: 'Opakowanie', qty: '1', price: '248,00', vat: '23', msrp: '379,00' },
    { name: 'Amortyzator tylny', code: '314 875', producer: 'SACHS', unit: 'Sztuka', qty: '2', price: '219,00', vat: '23', msrp: '' },
    { name: 'Świece zapłonowe (zestaw 4)', code: 'ZKR7A-10', producer: 'NGK', unit: 'Zestaw', qty: '1', price: '84,00', vat: '23', msrp: '' },
  ] },
];


const MORE_NAV = [
  { key: 'marketing', label: 'Marketing', icon: 'assets/nav/marketing.svg' },
  { key: 'settings', label: 'Ustawienia', icon: 'assets/nav/settings.svg' },
  { key: 'help', label: 'Pomoc', icon: 'assets/nav/help.svg' },
];

// ——— Szczegóły dotyczące warsztatu (port z zilo-front-v2) ———
const DAYS_PL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const DAYS_KEY = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

// aplikacja daje wybór co 30 minut przez całą dobę
const HOURS_30 = (() => {
  const out = [];
  for (let h = 0; h < 24; h += 1) {
    out.push(String(h).padStart(2, '0') + ':00');
    out.push(String(h).padStart(2, '0') + ':30');
  }
  return out;
})();

const godzinPL = (n) => (n === 1 ? 'godzina' : (n >= 2 && n <= 4 ? 'godziny' : 'godzin'));

const GARAGE_SEED = {
  name: 'DM Motors Mechanika Pojazdowa',
  phone: '601 234 567',
  email: 'kontakt@serwis-dm.pl',
  nip: '779 244 53 10',
  company: 'DM Motors Mechanika Pojazdowa',
  companyStreet: 'Pruszkowska 29a/166',
  companyZip: '02-119',
  companyCity: 'Warszawa',
  street: 'Pruszkowska 29a/166',
  city: 'Warszawa',
  quarter: 'Ochota',
  zip: '02-119',
  directions: 'Wjazd od podwórza, zieloną bramą obok myjni.',
  card: true,
  cash: true,
  useClientParts: false,
  logo: '',
  hours: {
    mon: { open: true, from: '08:00', to: '17:00' },
    tue: { open: true, from: '08:00', to: '17:00' },
    wed: { open: true, from: '08:00', to: '17:00' },
    thu: { open: true, from: '08:00', to: '17:00' },
    fri: { open: true, from: '08:00', to: '16:00' },
    sat: { open: true, from: '09:00', to: '13:00' },
    sun: { open: false, from: '09:00', to: '13:00' },
  },
};

const SETTINGS_COLUMNS = [
  {
    cards: [
      { title: 'Ustawienia konta', rows: [
        { key: 'shop', title: 'Szczegóły dotyczące warsztatu', subtitle: 'Ustaw informacje dotyczące warsztatu takie jak adres, godziny otwarcia i inne.' },
        { key: 'billing', title: 'Dane rozliczeniowe i faktury', subtitle: 'Sprawdź zlecenia z DobryMechanik.pl oraz faktury do zapłaty.' },
        { key: 'brands', title: 'Obsługiwane marki', subtitle: 'Ustaw marki pojazdów, które obsługujesz.' },
        { key: 'holiday', title: 'Urlop warsztatu', subtitle: 'Ustaw urlop warsztatu, aby zablokować możliwość umawiania się online.' },
      ] },
      { title: 'Asystent AI', rows: [
        { key: 'ai', title: 'Szczegóły Asystenta AI', subtitle: 'Ustaw, kiedy Asystent odbiera połączenia i co mówi klientom.' },
      ] },
      { title: 'Zespół', rows: [
        { key: 'employees', title: 'Pracownicy', subtitle: 'Zarządzaj dostępem zespołu, rolami i danymi pracowników.' },
      ] },
      { title: 'Wygląd Zilo', rows: [
        { key: 'interface', title: 'Interface', subtitle: 'Dostosuj wygląd panelu — motyw, gęstość widoków i domyślny układ kalendarza.' },
      ] },
    ],
  },
  {
    cards: [
      { title: 'Stanowiska', rows: [
        { key: 'workspaces', title: 'Stanowiska warsztatowe', subtitle: 'Dodaj nowe stanowiska warsztatowe oraz zarządzaj już istniejącymi.' },
        { key: 'services', title: 'Usługi i cennik', subtitle: 'Ustaw usługi które wykonujesz oraz uzupełnij ceny.' },
      ] },
      { title: 'Klienci', rows: [
        { key: 'import', title: 'Import bazy danych', subtitle: 'Zaimportuj bazę klientów oraz zleceń z innych źródeł.' },
        { key: 'system-notif', title: 'Powiadomienia systemowe', subtitle: 'Sprawdź treść SMSów oraz maili, które Zilo wysyła do Twoich klientów.' },
      ] },
      { title: 'Powiadomienia', rows: [
        { key: 'sms', title: 'Treść wiadomości SMS', subtitle: 'Dostosuj treść powiadomień SMS wysyłanych do klientów.' },
        { key: 'email', title: 'Szablony e-mail', subtitle: 'Zarządzaj szablonami wiadomości e-mail.' },
      ] },
      { title: 'Towary', rows: [
        { key: 'goods', title: 'Ustawienia towarów', subtitle: 'Grupy cenowe oraz integracje z hurtowniami.' },
      ] },
    ],
  },
];

const DEFAULT_PRICE_GROUPS = [
  { name: 'Klient detaliczny', pct: 45, mode: 'pct', isDefault: true },
  { name: 'Flota', pct: 35, mode: 'pct', isDefault: false },
  { name: 'Cennik producenta', pct: 0, mode: 'msrp', isDefault: false },
];

const SUPPLIERS = [
  { name: 'Inter Cars', mark: 'IC', note: 'Pobieraj dokumenty WZ i faktury z panelu IC Katalog.', steps: [
    { title: 'Zaloguj się do panelu IC Katalog', info: 'Wymagane działanie:', infoValue: 'W panelu IC Katalog wejdź w Ustawienia → Integracje i wygeneruj dostęp dla Zilo.' },
    { title: 'Podaj login do panelu B2B', field: 'login', label: 'Login', hint: 'Ten sam login, którym logujesz się do IC Katalog.' },
    { title: 'Podaj hasło', field: 'pass', label: 'Hasło' },
    { title: 'Podaj numer klienta', field: 'client', label: 'Numer klienta', hint: 'Znajdziesz go na fakturze od Inter Cars.' },
  ] },
  { name: 'Auto Partner', mark: 'AP', note: 'Automatyczne pobieranie dokumentów z panelu Auto Partner.', steps: [
    { title: 'Włącz dostęp API w panelu Auto Partner', info: 'Wymagane działanie:', infoValue: 'W panelu Auto Partner wejdź w Moje konto → API i włącz dostęp dla aplikacji zewnętrznych.' },
    { title: 'Podaj login do panelu', field: 'login', label: 'Login' },
    { title: 'Wklej klucz API', field: 'apiKey', label: 'Klucz API', hint: 'Klucz wygenerujesz w panelu Auto Partner w sekcji API.' },
  ] },
  { name: 'Gordon', mark: 'GOR', note: 'Pobieraj dokumenty zakupu z panelu Gordon B2B.', steps: [
    { title: 'Zaloguj się do panelu Gordon B2B', info: 'Wymagane działanie:', infoValue: 'Poproś opiekuna handlowego o włączenie integracji dla Twojego konta.' },
    { title: 'Podaj login', field: 'login', label: 'Login' },
    { title: 'Podaj hasło', field: 'pass', label: 'Hasło' },
  ] },
  { name: 'Elit Polska', mark: 'ELIT', note: 'Faktury i WZ pobierane z panelu Elit.', steps: [
    { title: 'Podaj identyfikator klienta', field: 'client', label: 'Identyfikator klienta', hint: 'Znajdziesz go w panelu Elit w sekcji Moje dane.' },
    { title: 'Podaj login', field: 'login', label: 'Login' },
    { title: 'Podaj hasło', field: 'pass', label: 'Hasło' },
  ] },
  { name: 'Motorol', mark: 'MOT', note: 'Integracja przez klucz API panelu Motorol.', steps: [
    { title: 'Wygeneruj klucz API', info: 'Wymagane działanie:', infoValue: 'W panelu Motorol wejdź w Ustawienia → Klucze API i wygeneruj nowy klucz.' },
    { title: 'Wklej klucz API', field: 'apiKey', label: 'Klucz API' },
  ] },
];

const SUPPLIER_INFO = {
  'Inter Cars': { name: 'Inter Cars S.A.', branchShort: 'Oddział Poznań-Górczyn', client: 'Nr klienta 88213', nip: '1181452946' },
  'Auto Partner': { name: 'Auto Partner S.A.', branchShort: 'Oddział Warszawa-Ursus', client: 'Nr klienta 44192', nip: '6262759101' },
  Gordon: { name: 'Gordon sp. z o.o.', branchShort: 'Oddział Poznań', client: 'Nr klienta 20874', nip: '7842216638' },
  'Elit Polska': { name: 'Elit Polska sp. z o.o.', branchShort: 'Oddział Warszawa', client: 'Nr klienta 13508', nip: '7822105420' },
  Motorol: { name: 'Motorol sp. z o.o.', branchShort: 'Oddział Piaseczno', client: 'Nr klienta 66021', nip: '1231399456' },
};

const DOC_STATUSES = ['W trakcie', 'Dostarczony', 'Anulowany'];

// świeżo wgrany dokument nosi dzisiejszą datę, żeby wchodził do grupy „Dzisiaj"
// Test w Useberry bywa pocięty na zadania, a między nimi strona wczytuje się od
// nowa. Dokumenty dodane przez testera trzymamy więc w jego przeglądarce, żeby
// zadanie 2 zastało to, co powstało w zadaniu 1. localStorage jest per
// przeglądarka i per domena, więc kolejny tester zaczyna od pustej listy.
// Wyczyszczenie: adres z #reset.
// v2, bo pierwsza wersja zapisywała całą listę — razem z danymi startowymi.
// Przez to skrócenie listy nie docierało do nikogo, kto raz wgrał dokument.
const DOCS_STORE_KEY = 'zilo-towary-docs-v2';
const isSeedDoc = (d) => DOC_SEED.some((x) => x.nr === (d && d.nr));
// trzymamy wyłącznie dokumenty dodane przez testera; reszta zawsze z danych startowych
const loadDocs = () => {
  try {
    const mine = JSON.parse(localStorage.getItem(DOCS_STORE_KEY) || 'null');
    const own = Array.isArray(mine) ? mine.filter((d) => d && d.nr && !isSeedDoc(d)) : [];
    return own.length ? own.concat(DOC_SEED) : null;
  } catch (e) { return null; }
};
const saveDocs = (list) => {
  try { localStorage.setItem(DOCS_STORE_KEY, JSON.stringify(list.filter((d) => !isSeedDoc(d)))); } catch (e) {}
  return list;
};

const DOC_DRAFT = { supplier: 'Inter Cars', nr: 'ZM/2026/0218', ext: 'FV 88213/08/2026',
  date: TODAY.slice(8, 10) + '.' + TODAY.slice(5, 7) + '.' + TODAY.slice(0, 4) };


const DOC_POSITIONS = [
  { name: 'Klocki hamulcowe przód', code: 'GDB1330', producer: 'TRW', unit: 'Sztuka', qty: '1', price: '184,00', vat: '23', msrp: '289,00' },
  { name: 'Tarcze hamulcowe przód', code: '24.0122-0187.1', producer: 'ATE', unit: 'Sztuka', qty: '2', price: '146,00', vat: '23', msrp: '219,00' },
  { name: 'Filtr oleju', code: 'HU 7020 z', producer: 'MANN', unit: 'Sztuka', qty: '1', price: '38,00', vat: '23', msrp: '' },
  { name: 'Olej silnikowy 5W30 5L', code: 'EDGE 5W30 LL', producer: 'Castrol', unit: 'Opakowanie', qty: '1', price: '248,00', vat: '23', msrp: '379,00' },
  { name: 'Amortyzator tylny', code: '314 875', producer: 'SACHS', unit: 'Sztuka', qty: '2', price: '219,00', vat: '23', msrp: '' },
  { name: 'Świece zapłonowe (zestaw 4)', code: 'ZKR7A-10', producer: 'NGK', unit: 'Zestaw', qty: '1', price: '84,00', vat: '23', msrp: '' },
  { name: 'Korek spustowy miski olejowej', code: 'N 908 132 02', producer: 'Febi', unit: 'Sztuka', qty: '1', price: '12,00', vat: '23', msrp: '' },
];

const DOC_DRAFT_ROWS = [
  { name: 'Olej silnikowy 5W30 5L', code: 'EDGE 5W30 LL', producer: 'Castrol', unit: 'Opakowanie', qty: '1', price: '248,00', vat: '23', msrp: '379,00' },
  { name: 'Filtr oleju', code: 'HU 7020 z', producer: 'MANN', unit: 'Sztuka', qty: '1', price: '38,00', vat: '23', msrp: '' },
  { name: 'Korek spustowy miski olejowej', code: 'N 908 132 02', producer: 'Febi', unit: 'Sztuka', qty: '1', price: '12,00', vat: '23', msrp: '' },
];

// Narzędzia fakturowe — ten sam wzorzec co integracje z hurtowniami
const SIGNUP_STEP = {
  title: 'Załóż konto w Fakturowni',
  info: 'Wymagane działanie:',
  infoValue: 'Fakturownia to jeden z najpopularniejszych programów do faktur w Polsce — obsługuje KSeF, '
    + 'faktury cykliczne i wysyłkę do klienta jednym kliknięciem, a dane same trafiają do księgowej. '
    + 'Konto zakładasz bezpośrednio u nich — Zilo nie pośredniczy w płatności. Plan wystarczający dla '
    + 'warsztatu kosztuje ok. 27 zł miesięcznie; darmowy ma limit trzech faktur na miesiąc.',
  cta: { label: 'Załóż konto w Fakturowni', href: 'https://fakturownia.pl' },
};

const BILLING_TOOLS = [
  { name: 'Fakturownia', mark: 'FKT', logo: 'assets/logos/fakturownia.png', note: 'Wystawiaj faktury z Zilo i trzymaj je w Fakturowni.', steps: [
    { title: 'Wygeneruj token API', info: 'Wymagane działanie:', infoValue: 'W Fakturowni wejdź w Ustawienia → Ustawienia konta → Integracja i skopiuj kod autoryzacyjny API.' },
    { title: 'Podaj adres konta', field: 'domain', label: 'Adres konta', hint: 'Pierwszy człon adresu, np. „mojwarsztat" z mojwarsztat.fakturownia.pl.' },
    { title: 'Wklej token API', field: 'apiKey', label: 'Token API' },
  ] },
  { name: 'wFirma', mark: 'WF', logo: 'assets/logos/wfirma.png', note: 'Faktury i KSeF po stronie wFirma, wystawianie z poziomu Zilo.', steps: [
    { title: 'Włącz dostęp API', info: 'Wymagane działanie:', infoValue: 'W wFirma wejdź w Ustawienia → Integracje → API i włącz dostęp dla aplikacji zewnętrznych.' },
    { title: 'Podaj login', field: 'login', label: 'Login' },
    { title: 'Wklej klucz API', field: 'apiKey', label: 'Klucz API' },
    { title: 'Podaj identyfikator firmy', field: 'company', label: 'ID firmy', hint: 'Znajdziesz go w adresie panelu po zalogowaniu.' },
  ] },
  { name: 'inFakt', mark: 'INF', logo: 'assets/logos/infakt.png', note: 'Automatyczne przesyłanie faktur do inFakt.', steps: [
    { title: 'Wygeneruj klucz API', info: 'Wymagane działanie:', infoValue: 'W inFakt wejdź w Ustawienia → API i wygeneruj klucz dla Zilo.' },
    { title: 'Wklej klucz API', field: 'apiKey', label: 'Klucz API' },
  ] },
  { name: 'iFirma', mark: 'IFR', logo: 'assets/logos/ifirma.png', note: 'Wystawiaj faktury bezpośrednio w iFirma.', steps: [
    { title: 'Podaj login', field: 'login', label: 'Login' },
    { title: 'Wklej klucz do faktur', field: 'apiKey', label: 'Klucz API (faktura)', hint: 'Klucz znajdziesz w iFirma w sekcji Narzędzia → API.' },
  ] },
  { name: 'Comarch Optima', mark: 'OPT', logo: 'assets/logos/comarch.png', note: 'Eksport faktur do Comarch ERP Optima.', steps: [
    { title: 'Włącz usługę Comarch Cloud', info: 'Wymagane działanie:', infoValue: 'Poproś opiekuna Comarch o włączenie dostępu API dla Twojej bazy.' },
    { title: 'Podaj login', field: 'login', label: 'Login' },
    { title: 'Podaj hasło', field: 'pass', label: 'Hasło' },
    { title: 'Podaj nazwę bazy', field: 'db', label: 'Nazwa bazy danych' },
  ] },
];

// zestaw komunikatów jest skończony — ekran nie pokazuje treści błędów dostawcy
const BILLING_ERRORS = [
  { key: 'dane-odrzucone', title: '%s odrzuciła te dane',
    hint: 'Sprawdź, czy klucz jest skopiowany w całości i czy adres konta się zgadza. '
      + 'Nic nie zapisaliśmy — możesz wkleić go jeszcze raz.' },
  { key: 'brak-autoryzacji', title: 'Konto nie ma dostępu do API',
    hint: 'Włącz dostęp dla aplikacji zewnętrznych w panelu %s i spróbuj ponownie.' },
  { key: 'limit-dostawcy', title: 'Przekroczony limit zapytań',
    hint: '%s chwilowo nie przyjmuje kolejnych prób. Spróbuj za kilka minut.' },
  { key: 'awaria-dostawcy', title: '%s nie odpowiada',
    hint: 'To nie jest problem z Twoimi danymi. Spróbuj ponownie później.' },
  { key: 'nieznany', title: 'Nie udało się połączyć',
    hint: 'Coś poszło nie tak po stronie połączenia. Spróbuj ponownie, a jeśli wróci — napisz do nas.' },
];

// konto w programie do faktur bywa podpięte pod kilka firm — nie zgadujemy
const BILLING_COMPANIES = [
  { name: 'Auto-Serwis Nowak', nip: '675 123 45 67' },
  { name: 'Nowak Nieruchomości', nip: '675 987 65 43' },
];

// prototyp pokazuje wszystkie stany sprawdzenia — jeden na narzędzie
const BILLING_OUTCOME = {
  Fakturownia: 'ok',
  wFirma: 'error',
  inFakt: 'companies',
};

const DEFAULT_BILLING = [
  { name: 'Fakturownia', date: '05.08.2026', fields: { domain: 'dmmotors', apiKey: '••••••••••••' } },
];

const DEFAULT_SUPPLIERS = [
  { name: 'Inter Cars', date: '02.06.2026', fields: { login: 'warsztat@dmmotors.pl', pass: '••••••••', client: '881203' } },
  { name: 'Auto Partner', date: '14.07.2026', fields: { login: 'dmmotors', apiKey: '••••••••••••' } },
];

const NAV = [
  { key: 'stats', label: 'Statystyki', icon: 'assets/nav/stats.svg' },
  { key: 'calendar', label: 'Kalendarz', icon: 'assets/nav/calendar.svg', fill: 'assets/nav/calendar-fill.svg' },
  { key: 'phone', label: 'Połączenia', icon: 'assets/nav/phone.svg' },
  { key: 'goods', label: 'Towary', icon: 'assets/nav/parts.svg', fill: 'assets/nav/parts-fill.svg' },
  { key: 'clients', label: 'Klienci', icon: 'assets/nav/clients.svg', fill: 'assets/nav/clients-fill.svg' },
  { key: 'to-issue', label: 'Do wydania', icon: 'assets/nav/to-issue.svg' , hidden: true },
  { key: 'services', label: 'Usługi', icon: 'assets/nav/services.svg' , hidden: true },
  { key: 'online', label: 'Profile Online', icon: 'assets/nav/online.svg' , hidden: true },
  { key: 'marketing', label: 'Marketing', icon: 'assets/nav/marketing.svg' },
  { key: 'reports', label: 'Raporty', icon: 'assets/nav/reports.svg', fill: 'assets/nav/reports-fill.svg' },
  { key: 'settings', label: 'Ustawienia', icon: 'assets/nav/settings.svg' },
];

const BRANDS = {
  Skoda: ['Fabia III', 'Octavia III', 'Superb III', 'Kamiq'],
  Toyota: ['Yaris', 'Corolla', 'Avensis', 'RAV4'],
  Volkswagen: ['Polo', 'Golf VII', 'Passat B8', 'Tiguan'],
  Audi: ['A1', 'A3', 'A4 B8', 'Q3'],
  BMW: ['320d E90', 'X3', '520i'],
  Ford: ['Fiesta', 'Focus MK3', 'Mondeo'],
  Opel: ['Corsa', 'Astra', 'Insignia'],
  Renault: ['Clio IV', 'Megane', 'Captur'],
};
const YEARS = (() => { const a = []; for (let y = 2026; y > 1986; y -= 1) a.push(String(y)); return a; })();

const PEOPLE = [
  { id: 'e3', initials: 'PN', name: 'Paweł Nowak' },
  { id: 'e4', initials: 'FD', name: 'Filip Domański' },
  { id: 'e6', initials: 'JK', name: 'Jakub Kuźniar' },
];

const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fromMin = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const MONTHS = ['stycznia','lutego','marca','kwietnia','maja','czerwca','lipca','sierpnia','września','października','listopada','grudnia'];
const MONTHS_NOM = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const WD_FULL = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];

class Component extends DCLogic {
  state = {
    screen: 'calendar',
    navKey: 'calendar',
    events: EVENTS.map((e) => ({ ...e })),
    selectedWs: [],
    dragId: null,
    dragOver: null,
    resize: null,
    clientId: 'c12',
    carIdx: 0,
    reportsQuery: '',
    reportsNavOpen: true,
    reportsTab: 'tires',
    query: '',
    page: 1,
    eventId: null,
    evTab: 'details',
    quotes: {},
    offerHistory: {},
    wycConfigSrc: null,
    offerConfigSrc: null,
    offerConfigVisit: null,
    fvConfigSrc: null,
    fvConfigVisit: null,
    fvHistory: {},
    visitTireDraftOnly: false,
    garage: JSON.parse(JSON.stringify(GARAGE_SEED)),
    garageDraft: null,
    garageModal: null,
    garageEdit: null,
    garageSelect: null,
    billingCheck: null,
    billingErrIdx: 0,
    billingEdit: null,
    billingDraft: null,
    connectedBilling: null,
    fvSellerEdit: false,
    fvAfterBilling: null,
    fvFlash: null,
    docReturn: null,
    offerFlash: null,
    wycConfigVisit: null,
    historyOpen: true,
    historyMenu: null,
    rowPeople: {},
    rowPeopleMenu: null,
    visitParts: {},
    clientCardOpen: true,
    editMode: null,
    editForm: null,
    openSelect: null,
    clientGroups: {},
    clientInvoice: Object.assign({}, DEFAULT_INVOICES),
    docUploadPct: 0,
    docSnack: false,
    docStatuses: {},
    docId: null,
    docEditing: null,
    docsList: loadDocs(),
    docSel: [],
    refReady: false,
    assignedVisitCar: '',
    assignedVisitTime: '',
    assignModal: false,
    assignQuery: '',
    assignPick: null,
    assignWs: 'all',
    assignToast: '',
    openDocStatus: null,
    docSnackRun: false,
    docDraft: null,
    docRows: null,
    extraDocs: [],
    groupReturn: null,
    docsQuery: '',
    clientsFilter: 'all',
    clientsFilterOpen: false,
    tireTip: null,
    openTireSet: null,
    openTireMenu: null,
    statusMenu: null,
    setStatus: {},
    tireForm: null,
    tireSelect: null,
    tireDateOpen: false,
    removedSets: {},
    addedSets: {},
    editedSets: {},
    seasonClash: null,
    tireStorageOn: true,
    featureDialogOpen: false,
    featureDraft: true,
    visitTireOpen: false,
    releaseForm: null,
    releaseSelect: null,
    visitClientForm: null,
    timeForm: null,
    timeSelect: null,
    timeDateOpen: false,
    wsDropdownOpen: false,
    assignedByVisit: {},
    assignedIds: [],
    assignMenuOpen: false,
  };

  weekRef = React.createRef();

  assignRef = React.createRef();
  evScrollRef = React.createRef();

  // Kalendarz otwiera się zawsze na tej samej godzinie u góry widoku.
  static DAY_START_H = 7;

  dayStartTop(el) {
    const row = (Component.DAY_START_H * 60) / SLOT_MIN;
    const max = Math.max(0, el.scrollHeight - el.clientHeight);
    return Math.min(max, Math.max(0, row * this.slotH()));
  }

  stopAutoScroll() {
    if (this.autoScrollTimer) { clearInterval(this.autoScrollTimer); this.autoScrollTimer = null; }
    if (this.__autoScrollStop) { clearTimeout(this.__autoScrollStop); this.__autoScrollStop = null; }
    const el = this.weekRef.current;
    if (el && this.__autoScrollCancel) {
      el.removeEventListener('wheel', this.__autoScrollCancel);
      el.removeEventListener('touchstart', this.__autoScrollCancel);
      el.removeEventListener('mousedown', this.__autoScrollCancel);
      el.removeEventListener('keydown', this.__autoScrollCancel);
    }
    this.__autoScrollCancel = null;
  }

  scrollToDayStart() {
    this.stopAutoScroll();
    let settled = 0;
    const apply = () => {
      const el = this.weekRef.current;
      if (!el || el.clientHeight <= 0 || el.scrollHeight <= el.clientHeight) return;
      const target = this.dayStartTop(el);
      if (Math.abs(el.scrollTop - target) > 2) { el.scrollTop = target; settled = 0; }
      else if (++settled >= 6) this.stopAutoScroll();
    };
    // od pierwszego ruchu użytkownika automat nie dotyka już scrollTop
    this.__autoScrollCancel = () => this.stopAutoScroll();
    const el = this.weekRef.current;
    if (el) {
      el.addEventListener('wheel', this.__autoScrollCancel, { passive: true });
      el.addEventListener('touchstart', this.__autoScrollCancel, { passive: true });
      el.addEventListener('mousedown', this.__autoScrollCancel);
      el.addEventListener('keydown', this.__autoScrollCancel);
    }
    apply();
    this.autoScrollTimer = setInterval(apply, 50);
    this.__autoScrollStop = setTimeout(() => this.stopAutoScroll(), 1200);
  }

  pollRefFrame() {
    if (this.__refPoll) clearInterval(this.__refPoll);
    let n = 0;
    this.__refPoll = setInterval(() => {
      n += 1;
      const done = this.injectRefChrome();
      if (done || n > 120) {
        clearInterval(this.__refPoll);
        this.__refPoll = null;
      }
    }, 20);
  }

  injectRefChrome() {
    const fr = this.__refFrame;
    if (!fr) return false;
    let doc;
    try { doc = fr.contentDocument; } catch (e) { return false; }
    if (!doc || !doc.head) return false;
    if (!doc.getElementById('__hostChrome')) {
      const st = doc.createElement('style');
      st.id = '__hostChrome';
      st.textContent = '.sidebar{display:none!important}.topbar{display:none!important}';
      doc.head.appendChild(st);
    }
    if (!doc.body) return false;
    if (!this.state.refReady) this.setState({ refReady: true });
    return true;
  }

  setupRefFrame() {
    const fr = this.__refFrame;
    if (!fr) return;
    this.injectRefChrome();
    let doc;
    try { doc = fr.contentDocument; } catch (e) { return; }
    if (!doc || !doc.head) return;
    const pending = this.__pendingVisit;
    if (!pending) return;
    this.__pendingVisit = null;
    const w = fr.contentWindow;
    setTimeout(() => {
      try {
        const list = w.APPOINTMENTS || [];
        if (pending.id) {
          const direct = (w.APPOINTMENTS || []).filter((a) => a.id === pending.id)[0];
          if (direct && typeof w.openVisitDetails === 'function') {
            w.openVisitDetails(direct);
            setTimeout(() => {
              try {
                const tabs = w.document.querySelectorAll('.vd-modal-scope .tab');
                for (let i = 0; i < tabs.length; i += 1) {
                  if ((tabs[i].textContent || '').trim().toLowerCase().indexOf('wycen') !== -1) { tabs[i].click(); break; }
                }
              } catch (e3) {}
            }, 350);
            return;
          }
        }
        const norm = (t) => String(t || '').replace(/^0/, '');
        const car = (pending.car || '').toLowerCase();
        const time = norm(pending.time);
        const nameOf = (a) => String(a.name || '').toLowerCase();
        const byBoth = list.filter((a) => nameOf(a).indexOf(car) !== -1 && norm(a.start) === time);
        const byCar = list.filter((a) => nameOf(a).indexOf(car) !== -1);
        const byTime = list.filter((a) => norm(a.start) === time);
        const hit = byBoth[0] || byCar[0] || byTime[0] || list[0];
        if (hit && typeof w.openVisitDetails === 'function') {
          w.openVisitDetails(hit);
          setTimeout(() => {
            try {
              const tabs = w.document.querySelectorAll('.vd-modal-scope .tab');
              for (let i = 0; i < tabs.length; i++) {
                if ((tabs[i].textContent || '').trim().toLowerCase().indexOf('wycen') !== -1) { tabs[i].click(); break; }
              }
            } catch (e2) {}
          }, 350);
        }
      } catch (e) {}
    }, 700);
  }

  onWycMessage(e) {
    const d = e && e.data;
    if (d && d.__ofr != null) { this.onOfferMessage(d); return; }
    if (d && d.__fv != null) { this.onFvMessage(d); return; }
    if (!d || d.__wyc == null) return;
    if (!this.state.wycConfigSrc) return;
    if (d.__wyc === 'preview') return;
    if (d.__wyc === 'addDoc') {
      const back = this.state.wycConfigVisit;
      const st = d.state || null;
      this.setState((prev) => ({
        // niezapisane pozycje wracają razem z nami — wgrywanie nie może ich zjeść
        quotes: st
          ? Object.assign({}, prev.quotes, { [back]: { state: st, items: ((prev.quotes || {})[back] || {}).items || [] } })
          : prev.quotes,
        docReturn: { visit: back, screen: prev.screen, eventId: prev.eventId, navKey: prev.navKey },
        wycConfigSrc: null,
        wycConfigVisit: null,
        navKey: 'goods',
        screen: 'docUpload',
        docUploadPct: 0,
        docRows: null,
        docDraft: null,
      }));
      return;
    }
    if (d.__wyc === 'save') {
      const id = this.state.wycConfigVisit;
      const send = !!d.send || !!this.__wycSend;
      const st = d.state || null;
      const rows = this.quoteRows(st);
      const uB = rows.uslugi.reduce((a, x) => a + x.c.gross, 0);
      const tB = rows.towary.reduce((a, x) => a + x.c.gross, 0);
      this.setState((prev) => {
        const quotes = Object.assign({}, prev.quotes, { [id]: { state: st, items: d.items || [] } });
        let history = prev.offerHistory;
        if (send) {
          const now = new Date();
          const M = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
          const entry = {
            date: now.getDate() + ' ' + M[now.getMonth()] + ', ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
            status: 'Wysłana',
            u: this.moneyPl(uB),
            t: this.moneyPl(tB),
            amt: this.moneyPl(uB + tB),
          };
          history = Object.assign({}, prev.offerHistory, { [id]: (prev.offerHistory[id] || []).concat([entry]) });
        }
        return {
          quotes: quotes,
          offerHistory: history,
          evTab: send ? 'wycena' : prev.evTab,
          historyOpen: send ? true : prev.historyOpen,
          offerFlash: send ? id + ':' + (prev.offerHistory[id] || []).length : prev.offerFlash,
          // przypisane towary weszły do wyceny — trzymanie ich dalej osobno dublowałoby wiersze
          visitParts: Object.assign({}, prev.visitParts, { [id]: [] }),
          wycConfigSrc: null,
          wycConfigVisit: null,
        };
      });
      this.__wycSend = false;
      this.ziloToast(send ? 'Oferta wysłana do klienta' : 'Wycena zapisana');
      if (send) this.flashScroll('offerFlash');
      return;
    }
    this.closeWycConfig();
  }

  closeWycConfig() {
    this.__wycSend = false;
    this.__wycFocus = null;
    if (this.state.wycConfigSrc) this.setState({ wycConfigSrc: null, wycConfigVisit: null });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.assignModal && !prevState.assignModal && this.__assignToday && this.__assignScroller) {
      const top = this.__assignToday.offsetTop - 8;
      this.__assignScroller.scrollTop = top > 0 ? top : 0;
    }
  }

  componentDidMount() {
    this.__onWycMessage = (e) => this.onWycMessage(e);
    window.addEventListener('message', this.__onWycMessage);
    this.__onWycKey = (e) => { if (e.key === 'Escape') this.closeWycConfig(); };
    window.addEventListener('keydown', this.__onWycKey);
    this.scrollToDayStart();
    this.onMouseMove = (e) => {
      const r = this.state.resize;
      if (!r) return;
      const delta = Math.round((e.clientY - r.startY) / this.slotH()) * SLOT_MIN;
      const dur = Math.max(SLOT_MIN, Math.min(600, r.startDur + delta));
      if (dur === r.current) return;
      this.setState((s) => ({
        resize: { ...s.resize, current: dur },
        events: s.events.map((ev) => (ev.id === r.id ? { ...ev, dur } : ev)),
      }));
    };
    this.onMouseUp = () => { if (this.state.resize) this.setState({ resize: null }); };
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    this.__closeDocStatus = (e) => {
      const t = e.target;
      if (this.state.openDocStatus && !(t && t.closest && t.closest('[data-doc]'))) {
        this.setState({ openDocStatus: null });
      }
    };
    document.addEventListener('click', this.__closeDocStatus);
  }

  componentWillUnmount() {
    if (this.__onWycMessage) window.removeEventListener('message', this.__onWycMessage);
    if (this.__onWycKey) window.removeEventListener('keydown', this.__onWycKey);
    this.stopAutoScroll();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    if (this.__onWycMessage) window.removeEventListener('message', this.__onWycMessage);
    if (this.__closeDocStatus) document.removeEventListener('click', this.__closeDocStatus);
    if (this.__uploadTimer) clearInterval(this.__uploadTimer);
    if (this.__ksefTimer) clearTimeout(this.__ksefTimer);
  }

  slotH() { return this.props.slotHeight ?? 30; }

  colorFor(ev) {
    const ws = WS.find((w) => w.id === ev.ws) || WS[0];
    const st = ST[ev.st];
    if ((this.props.colorBy ?? 'workspace') === 'status') {
      return { bg: st.bg, bar: st.dot, text: 'var(--tk-text)' };
    }
    return { bg: ws.color, bar: ws.border, text: ws.text };
  }

  visibleEvents() {
    const sel = this.state.selectedWs;
    return this.state.events.filter((e) => sel.length === 0 || sel.includes(e.ws));
  }

  slotIdxFromEvent(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = Math.floor((e.clientY - rect.top) / this.slotH());
    return Math.max(0, Math.min(95, idx));
  }

  buildDays() {
    const sel = this.state.selectedWs;
    const slotH = this.slotH();
    const drag = this.state.dragId ? this.state.events.find((e) => e.id === this.state.dragId) : null;

    return WEEK.map((key, dIdx) => {
      const list = this.state.events
        .filter((e) => e.d === dIdx && (sel.length === 0 || sel.includes(e.ws)))
        .map((e) => {
          const startRow = Math.floor(toMin(e.t) / SLOT_MIN);
          const span = Math.max(1, Math.ceil(e.dur / SLOT_MIN));
          return { e, startRow, endRow: startRow + span, lane: 0, laneSpan: 1 };
        })
        .sort((a, b) => a.startRow - b.startRow || a.endRow - b.endRow);

      const laneEnds = [];
      list.forEach((c) => {
        let assigned = -1;
        for (let i = 0; i < laneEnds.length; i += 1) {
          if (laneEnds[i] <= c.startRow) { assigned = i; break; }
        }
        if (assigned === -1) { assigned = laneEnds.length; laneEnds.push(c.endRow); }
        else laneEnds[assigned] = c.endRow;
        c.lane = assigned;
      });
      const lanes = Math.max(1, laneEnds.length);
      list.forEach((c) => {
        let span = 1;
        for (let i = c.lane + 1; i < lanes; i += 1) {
          const overlap = list.some((o) => o !== c && o.lane === i && o.startRow < c.endRow && o.endRow > c.startRow);
          if (overlap) break;
          span += 1;
        }
        c.laneSpan = span;
      });

      const placed = list.map((c) => {
        const ev = c.e;
        const col = this.colorFor(ev);
        const st = ST[ev.st];
        const height = (c.endRow - c.startRow) * slotH;
        const resizing = this.state.resize && this.state.resize.id === ev.id;
        const movable = st.order < 3;
        return {
          id: ev.id,
          gridRow: (c.startRow + 1) + ' / ' + (c.endRow + 1),
          gridColumn: (c.lane + 1) + ' / span ' + c.laneSpan,
          bg: col.bg,
          bar: col.bar,
          text: col.text,
          opacity: this.state.dragId === ev.id ? 0.35 : (st.order === 3 ? 0.5 : 1),
          timeLabel: ev.t + '–' + fromMin(toMin(ev.t) + ev.dur),
          title: ev.brand + ' ' + ev.model,
          reason: ev.reason,
          statusName: st.name,
          statusDot: st.dot,
          assignee: (((this.state.assignedByVisit || {})[ev.id] || []).map((pid) => (PEOPLE.find((p) => p.id === pid) || {}).initials).filter(Boolean)[0]) || '',
          hasAssignee: (((this.state.assignedByVisit || {})[ev.id] || []).length > 0),
          showTitle: height >= 40,
          showReason: height >= 58,
          showStatus: height >= 92,
          draggable: movable ? 'true' : 'false',
          resizable: movable,
          resizeBg: resizing ? 'rgba(34,38,147,0.2)' : 'transparent',
        };
      });

      let ghost = null;
      if (drag && this.state.dragOver && this.state.dragOver.day === key) {
        const idx = this.state.dragOver.slot;
        const span = Math.max(1, Math.ceil(drag.dur / SLOT_MIN));
        const col = this.colorFor(drag);
        const startMin = idx * SLOT_MIN;
        ghost = {
          gridRow: (idx + 1) + ' / ' + (idx + span + 1),
          bg: col.bg,
          bar: col.bar,
          text: col.text,
          timeLabel: fromMin(startMin) + '–' + fromMin(startMin + drag.dur),
          title: drag.brand + ' ' + drag.model,
        };
      }

      const isToday = key === TODAY;
      const isWeekend = dIdx >= 5;
      return {
        key,
        label: WD[dIdx] + ' ' + key.slice(8, 10) + '.' + key.slice(5, 7),
        count: placed.length,
        bg: isWeekend ? 'var(--tk-canvas)' : 'var(--tk-surface)',
        titleColor: isToday ? 'var(--tk-brand-fg)' : 'var(--tk-text-strong)',
        titleWeight: isToday ? 500 : 400,
        borderRight: dIdx === 6 ? '1px solid var(--tk-border-2)' : '0px solid transparent',
        radius: dIdx === 0 ? '10px 0 0 10px' : (dIdx === 6 ? '0 10px 10px 0' : '0'),
        lanes,
        placed,
        ghost,
      };
    });
  }

  filteredClients() {
    const q = this.state.query.trim().toLowerCase();
    const onlyTires = this.state.clientsFilter === 'tires';
    let list = CLIENTS;
    if (onlyTires) list = list.filter((c) => c.cars.some((car) => TIRES[car.id]));
    if (!q) return list;
    return list.filter((c) => {
      const hay = [c.name, c.phone, c.email].concat(
        c.cars.map((car) => {
          const t = TIRES[car.id];
          return [car.brand, car.model, car.plate, car.vin, t ? t.code + ' ' + t.season : ''].join(' ');
        }),
      ).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  eventDetails() {
    const ev = this.state.events.find((e) => e.id === this.state.eventId);
    if (!ev) return null;
    const ws = WS.find((w) => w.id === ev.ws) || WS[0];
    const st = ST[ev.st];
    const client = CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate));
    const car = client ? client.cars.find((c) => c.plate === ev.plate) : null;
    const date = WEEK[ev.d];
    const visit = client ? (client.cars.find((c) => c.plate === ev.plate) || { visits: [] }).visits.find((v) => v.id === ev.id) : null;
    return {
      statusName: st.name,
      statusDot: st.dot,
      statusBg: st.bg,
      statusRing: 'color-mix(in srgb, ' + st.dot + ' 35%, var(--tk-surface))',
      reason: ev.reason,
      dateLabel: WD[ev.d] + ', ' + Number(date.slice(8, 10)) + ' ' + MONTHS[Number(date.slice(5, 7)) - 1] + ' ' + date.slice(0, 4) + ', ' + ev.t + '–' + fromMin(toMin(ev.t) + ev.dur),
      wsName: ws.title,
      wsBg: ws.color,
      wsBorder: ws.border,
      wsText: ws.text,
      clientName: client ? client.name : ev.client,
      phone: ev.phone,
      carMakeModel: ev.brand + ' ' + ev.model,
      plate: ev.plate,
      vin: car && car.vin ? car.vin : '-',
      year: car && car.year ? car.year : '-',
      engine: car && car.engine ? car.engine : '-',
      notes: NOTES[ev.id] || 'Edytuj opis zlecenia',
      notesColor: NOTES[ev.id] ? 'var(--tk-text)' : 'var(--tk-text-2)',   // podpowiedź w grey-2, treść normalnie
      // kwota żyje w wycenie — tu zawsze zachęta do edycji
      price: 'Edytuj cenę',
      priceColor: 'var(--tk-text-2)',
      tabs: [
        { key: 'details', label: 'Szczegóły zlecenia', icon: 'assets/icons/tab-details.svg' },
        { key: 'wycena', label: 'Wyceny', icon: 'assets/icons/tab-price.svg' },
        { key: 'ai', label: 'Asystent AI', icon: 'assets/icons/tab-ai.svg' },
      ].map((t) => ({
        key: t.key,
        label: t.label,
        icon: t.icon,
        active: (this.state.evTab || 'details') === t.key,
        color: (this.state.evTab || 'details') === t.key ? 'var(--tk-brand-fg)' : 'var(--tk-text)',
        pick: () => this.setState({ evTab: t.key }),
      })),
      wyc: this.wycVals(ev),
      tabDetails: (this.state.evTab || 'details') === 'details',
      tabWycena: (this.state.evTab || 'details') === 'wycena',
      tabAi: (this.state.evTab || 'details') === 'ai',
      parts: (this.state.visitParts || {})[ev.id] || [],
      noParts: (((this.state.visitParts || {})[ev.id]) || []).length === 0,
      sumNet: this.moneyPl(180 + (((this.state.visitParts || {})[ev.id]) || []).reduce((a, p) => a + this.docNum(p.netRaw), 0)),
      sumGross: this.moneyPl((180 + (((this.state.visitParts || {})[ev.id]) || []).reduce((a, p) => a + this.docNum(p.netRaw), 0)) * 1.23),
    };
  }

  tireVals() {
    const f = this.state.tireForm;
    if (!f) return { open: false };
    const openSel = this.state.tireSelect;
    const mk = (key, value, options) => {
      const open = openSel === key;
      const has = !!value;
      return {
        key, value, options: options.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent', ...seasonBits(o) })), ...seasonBits(value),
        open, hasValue: has,
        border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
        labelSize: has ? '12px' : '16px',
        labelLine: has ? '16px' : '20px',
        chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
      };
    };
    const fld = (value, label) => ({
      filled: !!value,
      pad: value ? '9px 13px 13px 13px' : '20px 13px',
      ph: value ? '' : label,
    });
    const POS = ['Lewy przód', 'Prawy przód', 'Lewy tył', 'Prawy tył', 'Koło zapasowe'];
    const DOW = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz'];
    const MON_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    const MON_FULL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    const dateOpen = this.state.tireDateOpen;
    const sel = f.date;
    const [sy, sm, sd] = sel.split('-').map(Number);
    const cur = f.calMonth || { y: sy, m: sm - 1 };
    const first = new Date(cur.y, cur.m, 1);
    const lead = (first.getDay() + 6) % 7;
    const dim = new Date(cur.y, cur.m + 1, 0).getDate();
    const pad = (n) => String(n).padStart(2, '0');
    const days = [];
    for (let i = 0; i < lead; i += 1) days.push({ label: '', value: '', visibility: 'hidden', bg: 'transparent', color: 'var(--tk-text)' });
    for (let d = 1; d <= dim; d += 1) {
      const value = cur.y + '-' + pad(cur.m + 1) + '-' + pad(d);
      const isSel = value === sel;
      const isToday = value === '2026-08-13';
      days.push({
        label: String(d), value, visibility: 'visible',
        bg: isSel ? 'var(--tk-brand)' : (isToday ? 'var(--tk-info)' : 'transparent'),
        color: isSel || isToday ? 'var(--tk-on-fill)' : 'var(--tk-text)',
      });
    }
    const selDate = new Date(sy, sm - 1, sd);
    return {
      open: true,
      title: f.editKey ? 'Edytuj komplet opon' : 'Nowy komplet opon',
      emailDisplay: f.editKey ? 'none' : 'inline-flex',
      panels: (f.panels && f.panels.length ? f.panels : [{ key: f.editKey || 'new', season: f.season }]).map((p) => ({
        key: p.key,
        title: (() => {
          if (!p.season) return 'Opony';
          let code = p.code;
          if (!code && p.key && p.key.indexOf('::') > -1) {
            const [cid, idx] = p.key.split('::');
            const found = this.tireSetsFor(cid).find((x) => x.__idx === Number(idx));
            code = found ? found.code : '';
          }
          return p.season + (code ? ' nr. ' + code : '');
        })(),
        ...seasonBits(p.season),
        active: p.key === (f.editKey || 'new') && !f.collapsed,
        arrow: p.key === (f.editKey || 'new') && !f.collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
      })),
      saveLabel: f.editKey ? 'Zapisz zmiany' : 'Zapisz komplet',
      date: f.date,
      dateLabel: DOW[(selDate.getDay() + 6) % 7] + ', ' + sd + ' ' + MON_SHORT[sm - 1] + ' ' + sy,
      dateOpen,
      dateBorder: dateOpen ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
      datePad: dateOpen ? '8px 12px' : '9px 13px 13px 13px',
      dateIconColor: dateOpen ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
      calTitle: MON_FULL[cur.m] + ' ' + cur.y,
      calWeekdays: DOW.map((d) => ({ label: d })),
      calDays: days,
      location: f.location,
      hasLocation: !!f.location,
      locPad: f.location ? '9px 13px 13px 13px' : '20px 13px',
      locPh: f.location ? '' : 'Lokalizacja',
      locCount: String(String(f.location || '').length) + '/40',
      note: f.note,
      noteHeight: (22 * Math.max(1, String(f.note || '').split(String.fromCharCode(10)).length) + 24) + 'px',
      files: f.files.map((x, i) => ({ key: 'f' + i })),
      hasFiles: f.files.length > 0,
      sameAll: f.sameAll,
      perWheel: !f.sameAll,
      sameAllChecked: f.sameAll ? 'true' : 'false',
      sameAllTrack: f.sameAll ? 'var(--tk-brand)' : 'var(--tk-text-3)',
      sameAllKnob: f.sameAll ? '25.625px' : '1.625px',
      sameAllHint: f.sameAll ? 'Wyłącz, aby wpisać każde koło osobno.' : 'Wyłączony — każda opona ma własne pola i pozycję.',
      emailConfirm: f.emailConfirm,
      emailChecked: f.emailConfirm ? 'true' : 'false',
      checkBorder: f.emailConfirm ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      checkBg: f.emailConfirm ? 'var(--tk-brand)' : 'var(--tk-surface)',
      checkTickOpacity: f.emailConfirm ? 1 : 0,
      seasonSel: mk('season', f.season, ['Zima', 'Lato', 'Całoroczne']),
      rimSel: mk('rim', f.block.rim, ['Tak', 'Nie']),
      makerSel: mk('maker', f.block.maker, TIRE_MAKERS),
      sizeF: fld(f.block.size, 'Rozmiar'),
      treadF: fld(f.block.tread, 'Głębokość bieżnika'),
      qtyF: fld(f.block.qty, 'Ilość'),
      block: f.block,
      canAddThree: f.wheels.length === 1,
      wheels: f.wheels.map((w, i) => {
        const rim = mk('wrim::' + w.id, w.rim, ['Tak', 'Nie']);
        const mkr = mk('wmaker::' + w.id, w.maker, TIRE_MAKERS);
        return {
          id: w.id,
          title: 'Opona ' + (i + 1),
          removable: f.wheels.length > 1,
          removeOpacity: f.wheels.length > 1 ? 1 : 0.35,
          removeEvents: f.wheels.length > 1 ? 'auto' : 'none',
          maker: w.maker, size: w.size, tread: w.tread, qty: w.qty,
          hasSize: !!w.size,  sizePad: w.size ? '9px 13px 13px 13px' : '20px 13px', sizePh: w.size ? '' : 'Profil',
          qtyFilled: !!w.qty, qtyPad: w.qty ? '9px 13px 13px 13px' : '20px 13px', qtyPh: w.qty ? '' : 'ilość',
          treadFilled: !!w.tread, treadPad: w.tread ? '9px 13px 13px 13px' : '20px 13px', treadPh: w.tread ? '' : 'Głębokość bieżnika',
          hasMaker: !!w.maker, makerKey: mkr.key, makerOpen: mkr.open, makerOptions: mkr.options,
          makerBorder: mkr.border, makerPad: mkr.bodyPad, makerLabelSize: mkr.labelSize, makerLabelLine: mkr.labelLine, makerChevron: mkr.chevronRotate,
          rim: w.rim, hasRim: !!w.rim, rimKey: rim.key, rimOpen: rim.open, rimOptions: rim.options,
          rimBorder: rim.border, rimPad: rim.bodyPad, rimLabelSize: rim.labelSize, rimLabelLine: rim.labelLine, rimChevron: rim.chevronRotate,
        };
      }),
    };
  }

  releaseVals() {
    const f = this.state.releaseForm;
    if (!f) return { open: false, options: [], outWheels: [] };
    const carId = this.visitCarId();
    const sets = carId ? this.tireSetsFor(carId) : [];
    const out = sets.find((t) => (carId + '::' + t.__idx) === f.setKey) || sets[0];
    const other = sets.find((t) => t !== out);
    const outRows = out ? this.specRows(out.wheels) : [];
    const outAnyTread = outRows.some((r) => !!r.tread);
    const outCols = outAnyTread ? 'auto auto auto auto auto' : 'auto auto auto auto';
    const outTipRows = outRows.map((r, wi) => ({
      maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
      tread: r.tread || '—', showTread: outAnyTread,
      rowBorder: wi === 0 ? 'transparent' : 'var(--tk-border-2)',
    }));
    const relSel = (key, value, options) => {
      const open = this.state.releaseSelect === key;
      const has = !!value;
      return {
        key, value, hasValue: has, open,
        border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
        labelSize: has ? '12px' : '16px',
        labelLine: has ? '16px' : '20px',
        chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
        options: options.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent' })),
      };
    };
    const sel = f.choice;
    const optBase = (key, label) => ({
      key, label,
      checked: sel === key ? 'true' : 'false',
      border: sel === key ? '1px solid var(--tk-brand-bd)' : '1px solid var(--tk-border)',
      bg: sel === key ? 'var(--tk-surface-2)' : 'var(--tk-surface)',
      radioBg: sel === key ? 'var(--tk-brand)' : 'var(--tk-surface)',
      radioBorder: sel === key ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      dotScale: sel === key ? 'scale(1)' : 'scale(0)',
      showSet: false,
      showNewForm: false,
      setWheels: [],
    });
    const options = [];
    if (other) {
      const o = optBase('existing', 'Komplet ' + other.season.toLowerCase() + ' klienta');
      o.showSet = sel === 'existing';
      o.setSeason = other.season;
      o.setCode = other.code;
      Object.assign(o, seasonVals(other.season, 'set'));
      o.setReleased = other.released || '—';
      o.setReleasedLabel = other.released || '—';
      o.setReceived = other.received || '—';
      const oIn = (this.state.setStatus[carId + '::' + other.__idx] || other.status) === 'in';
      o.setStatusLabel = oIn ? 'W przechowalni' : 'Wydane';
      o.setStatusBg = oIn ? 'var(--tk-ok-soft)' : 'var(--tk-surface-3)';
      o.setStatusColor = oIn ? 'var(--tk-ok-fg)' : 'var(--tk-text-2)';
      o.setStatusDot = oIn ? 'var(--tk-ok)' : 'var(--tk-text-3)';
      o.setRowBg = f.optSetOpen ? 'var(--tk-surface-2)' : 'var(--tk-surface)';
      o.setOpen = !!f.optSetOpen;
      o.setArrow = f.optSetOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      const oRows = this.specRows(other.wheels);
      const oAny = oRows.some((r) => !!r.tread);
      o.setTipVisible = !!this.state.releaseOptTip;
      o.setTipCols = oAny ? 'auto auto auto auto auto' : 'auto auto auto auto';
      o.setTipHasTread = oAny;
      o.setTipWheels = oRows.map((r, wi) => ({
        maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
        tread: r.tread || '—', showTread: oAny,
        rowBorder: wi === 0 ? 'transparent' : 'var(--tk-border-2)',
      }));
      o.setWheels = this.specRows(other.wheels).map((r) => ({ maker: r.maker, size: r.size, rim: r.rim, tread: r.tread || '—', qty: String(r.qty) }));
      options.push(o);
    }
    const oNew = optBase('new', 'Nowy komplet');
    oNew.showNewForm = sel === 'new';
    options.push(oNew);
    options.push(optBase('none', 'Nie przyjmuję kompletu'));

    const seasonOpen = this.state.releaseSelect === 'newSeason';
    const hasSeason = !!f.newSeason;
    return {
      open: true,
      outSeason: out ? out.season : '',
      outCode: out ? out.code : '',
      ...seasonVals(out ? out.season : '', 'out'),
      outReceived: out ? out.received : '',
      outLocation: out ? out.location : '',
      outHasLocation: !!(out && out.location),
      outWheels: out ? (() => {
        const rows = this.specRows(out.wheels);
        const anyTread = rows.some((r) => !!r.tread);
        return rows.map((r) => ({
          maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
          tread: r.tread || '—', showTread: anyTread,
          cols: anyTread ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
        }));
      })() : [],
      outTreadCols: out && this.specRows(out.wheels).some((r) => !!r.tread) ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
      outHasTread: !!(out && this.specRows(out.wheels).some((r) => !!r.tread)),
      outOpen: f.outOpen,
      outArrow: f.outOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      outTipVisible: !!this.state.releaseOutTip,
      outReleasedLabel: (out && out.released) ? out.released : '—',
      outStatusLabel: 'W przechowalni',
      outStatusBg: 'var(--tk-ok-soft)',
      outStatusColor: 'var(--tk-ok-fg)',
      outStatusDot: 'var(--tk-ok)',
      outRowBg: f.outOpen ? 'var(--tk-surface-2)' : 'var(--tk-surface)',
      outTipCols: outCols,
      outTipHasTread: outAnyTread,
      outTipWheels: outTipRows,
      options,
      newExpanded: !!f.newExpanded,
      existingEmailChecked: f.existingEmail ? 'true' : 'false',
      existingEmailBg: f.existingEmail ? 'var(--tk-brand)' : 'var(--tk-surface)',
      existingEmailBorder: f.existingEmail ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      existingEmailTick: f.existingEmail ? 1 : 0,
      newEmailChecked: f.newEmail ? 'true' : 'false',
      newEmailBg: f.newEmail ? 'var(--tk-brand)' : 'var(--tk-surface)',
      newEmailBorder: f.newEmail ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      newEmailTick: f.newEmail ? 1 : 0,
      newMoreLabel: f.newExpanded ? 'Ukryj pozostałe dane' : 'Pozostałe dane',
      newMoreArrow: f.newExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
      newQty: f.newQty,
      newQtyF: { filled: !!f.newQty, pad: f.newQty ? '9px 13px 13px 13px' : '20px 13px', ph: f.newQty ? '' : 'Ilość' },
      newSize: f.newSize,
      newSizeF: { filled: !!f.newSize, pad: f.newSize ? '9px 13px 13px 13px' : '20px 13px', ph: f.newSize ? '' : 'Profil' },
      newTread: f.newTread,
      newTreadF: { filled: !!f.newTread, pad: f.newTread ? '9px 13px 13px 13px' : '20px 13px', ph: f.newTread ? '' : 'Głębokość bieżnika' },
      newMakerSel: relSel('newMaker', f.newMaker, TIRE_MAKERS),
      newRimSel: relSel('newRim', f.newRim, ['Tak', 'Nie']),
      newSeasonSel: {
        key: 'newSeason',
        value: f.newSeason,
        hasValue: hasSeason,
        open: seasonOpen,
        border: seasonOpen ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        bodyPad: seasonOpen ? (hasSeason ? '8px 12px' : '19px 12px') : (hasSeason ? '9px 13px 13px 13px' : '20px 13px'),
        labelSize: hasSeason ? '12px' : '16px',
        labelLine: hasSeason ? '16px' : '20px',
        chevronRotate: seasonOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: seasonOpen ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
        options: ['Zima', 'Lato', 'Całoroczne'].map((o) => ({ value: o, selected: o === f.newSeason, bg: o === f.newSeason ? 'var(--tk-surface-2)' : 'transparent' })),
      },
    };
  }

  setForm(st, setKey) {
    const forms = { ...(st.visitTireForms || {}) };
    if (forms[setKey]) return forms;
    if (setKey.indexOf('::') === -1) {
      forms[setKey] = { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '', location: '' };
      return forms;
    }
    const [carId, idx] = setKey.split('::');
    const t = this.tireSetsFor(carId).find((x) => x.__idx === Number(idx));
    if (t) forms[setKey] = this.buildSetForm(carId, t);
    return forms;
  }

  pushSellerToFv() {
    const seller = this.garageSeller();
    try {
      const f = document.querySelectorAll('iframe');
      for (let i = 0; i < f.length; i += 1) {
        f[i].contentWindow.postMessage({ __fvSeller: seller }, '*');
      }
    } catch (e) {}
  }

  // ——— Dane rozliczeniowe i faktury ———
  billingSteps(draft) {
    const tool = BILLING_TOOLS.filter((x) => x.name === draft.name)[0];
    if (!tool) return [];
    const fields = draft.fields || {};
    // wchodząc przez „Nie masz jeszcze programu?" zaczynamy od założenia konta
    const steps = draft.signup ? [SIGNUP_STEP].concat(tool.steps) : tool.steps;
    return steps.map((st, i) => ({
      no: String(i + 1),
      title: st.title,
      border: i === steps.length - 1 ? 'transparent' : 'var(--tk-border-2)',
      hasInfo: !!st.info,
      infoLabel: st.info || '',
      infoValue: st.infoValue || '',
      hasCta: !!st.cta,
      ctaLabel: st.cta ? st.cta.label : '',
      ctaHref: st.cta ? st.cta.href : '',
      hasField: !!st.field,
      fieldLabel: st.label || '',
      value: fields[st.field] || '',
      field: this.dsFieldState(fields[st.field]),
      hasHint: !!st.hint,
      hint: st.hint || '',
      setValue: (e) => {
        const v = e.target.value;
        const cur = this.state.billingDraft || { name: draft.name, fields: {}, editing: draft.editing };
        this.setState({
          billingDraft: Object.assign({}, cur, { fields: Object.assign({}, cur.fields, { [st.field]: v }) }),
        });
      },
    }));
  }

  // ——— sprawdzenie połączenia po „Połącz" ———
  runBillingCheck(row, isEdit) {
    // w prototypie wynik zależy od narzędzia, żeby dało się obejrzeć każdy stan
    const outcome = BILLING_OUTCOME[row.name] || 'ok';
    this.setState({ billingCheck: { phase: 'checking', row: row, isEdit: !!isEdit, pick: 0 } });
    if (this.__billingTimer) clearTimeout(this.__billingTimer);
    this.__billingTimer = setTimeout(() => {
      if (outcome === 'error') {
        const i = this.state.billingErrIdx || 0;
        this.setState((st) => ({
          billingCheck: Object.assign({}, st.billingCheck, { phase: 'error', errIdx: i }),
          billingErrIdx: (i + 1) % BILLING_ERRORS.length,
        }));
        return;
      }
      if (outcome === 'companies') {
        this.setState((st) => ({ billingCheck: Object.assign({}, st.billingCheck, { phase: 'companies' }) }));
        return;
      }
      this.commitBilling();
    }, 1600);
  }

  commitBilling() {
    const chk = this.state.billingCheck || {};
    const row = Object.assign({}, chk.row);
    if (chk.phase === 'companies' || typeof chk.pick === 'number') {
      const c = BILLING_COMPANIES[chk.pick || 0];
      if (c && chk.phase === 'companies') row.company = c.name;
    }
    this.setState((st) => ({
      connectedBilling: [row],
      billingCheck: Object.assign({}, st.billingCheck, { phase: 'ok', row: row }),
    }));
  }

  billingCheckVals() {
    const s = this.state;
    const chk = s.billingCheck;
    if (!chk) return { open: false };
    const name = (chk.row && chk.row.name) || '';
    const err = BILLING_ERRORS[chk.errIdx || 0];
    const back = s.fvAfterBilling;
    const close = () => this.setState({ billingCheck: null });
    return {
      open: true,
      name: name,
      checking: chk.phase === 'checking',
      isError: chk.phase === 'error',
      isCompanies: chk.phase === 'companies',
      isOk: chk.phase === 'ok',

      errTitle: err.title.replace('%s', name),
      errHint: err.hint.replace('%s', name),
      // „Popraw dane" wraca do formularza z tym, co użytkownik już wpisał
      fixData: close,
      retry: () => this.runBillingCheck(chk.row, chk.isEdit),

      companies: BILLING_COMPANIES.map((c, i) => ({
        name: c.name,
        nip: 'NIP ' + c.nip,
        picked: (chk.pick || 0) === i,
        border: (chk.pick || 0) === i ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border)',
        bg: (chk.pick || 0) === i ? 'var(--tk-brand-soft)' : 'var(--tk-surface)',
        dotBorder: (chk.pick || 0) === i ? '6px solid var(--tk-brand)' : '2px solid var(--tk-border-strong)',
        pick: () => this.setState((st) => ({ billingCheck: Object.assign({}, st.billingCheck, { pick: i }) })),
      })),
      confirmCompany: () => this.commitBilling(),

      okTitle: chk.isEdit ? 'Połączenie zaktualizowane' : 'Połączono z ' + name,
      okHint: chk.isEdit
        ? 'Dane połączenia zostały zapisane.'
        : 'Faktury wystawione w Zilo trafią do ' + name + '.',
      // z „Wystaw FV" wracamy prosto na fakturę, inaczej na listę integracji
      okLabel: back ? 'Przejdź do wystawienia faktury' : 'Gotowe',
      finish: () => {
        const toFv = this.state.fvAfterBilling;
        const wasEdit = chk.isEdit;
        this.setState({
          billingCheck: null,
          screen: toFv ? toFv.screen : 'billing',
          fvAfterBilling: null,
        });
        this.ziloToast(wasEdit ? 'Zmiany zapisane pomyślnie' : 'Połączono z ' + name);
        if (toFv) this.openInvoiceConfig(toFv.visitId, Object.assign({}, toFv.opts || {}, { force: true }));
      },
    };
  }

  billingVals() {
    const s = this.state;
    const g = s.garage || GARAGE_SEED;
    const f = s.garageDraft || {};
    const connected = s.connectedBilling || DEFAULT_BILLING;
    const bDraft = s.billingDraft || { name: '', fields: {}, editing: null };
    const patch = (key) => (e) => this.garagePatch({ [key]: e.target.value });

    return {
      noneConnected: connected.length === 0,
      // dane firmy pokazujemy dopiero po połączeniu — wcześniej nie ma ich skąd wziąć
      hasConnected: connected.length > 0,
      nip: g.nip || '—',
      companyName: g.company || '—',
      companyStreet: g.companyStreet || '—',
      companyZip: g.companyZip || '—',
      companyCity: g.companyCity || '—',
      editCompany: () => this.setState({
        billingEdit: 'company',
        fvSellerEdit: false,
        garageDraft: JSON.parse(JSON.stringify(s.garage || GARAGE_SEED)),
      }),

      companyOpen: s.billingEdit === 'company',
      dNip: this.nipFormat(f.nip || ''),
      dNipRest: this.nipRest(f.nip || ''),
      setNip: (e) => this.garagePatch({ nip: this.nipFormat(e.target.value) }),
      // dane firmowe zaciąga dopiero przycisk — tak samo jak przy kliencie i na fakturze
      gusDisabled: !this.nipComplete(f.nip),
      gusOpacity: this.nipComplete(f.nip) ? '1' : '0.45',
      gusCursor: this.nipComplete(f.nip) ? 'pointer' : 'not-allowed',
      fetchGus: () => {
        if (!this.nipComplete(f.nip)) return;
        this.garagePatch({
          company: 'DM Motors Mechanika Pojazdowa',
          companyStreet: 'Pruszkowska 29a/166',
          companyZip: '02-119',
          companyCity: 'Warszawa',
        });
        this.ziloToast('Dane firmy pobrane z GUS');
      },
      dCompany: f.company || '', setCompany: patch('company'),
      dStreet: f.companyStreet || '', setStreet: patch('companyStreet'),
      dZip: f.companyZip || '', setZip: patch('companyZip'),
      dCity: f.companyCity || '', setCity: patch('companyCity'),
      closeCompany: () => this.setState({ billingEdit: null, garageDraft: null, fvSellerEdit: false }),
      saveCompany: () => {
        // flagę czytamy przed zapisem — zapis ją gasi
        const fromInvoice = !!this.state.fvSellerEdit;
        this.setState((st) => {
          const next = Object.assign({}, st.garage);
          ['nip', 'company', 'companyStreet', 'companyZip', 'companyCity']
            .forEach((k) => { next[k] = (st.garageDraft || {})[k]; });
          return { garage: next, billingEdit: null, garageDraft: null, fvSellerEdit: false };
        });
        // wracamy na fakturę z nowymi danymi sprzedawcy, bez przeładowania iframe'a
        if (fromInvoice) this.pushSellerToFv();
        this.ziloToast('Zmiany zapisane pomyślnie');
      },

      tools: connected.map((c, i) => ({
        name: c.name,
        date: c.date,
        status: 'Aktywne',
        statusDot: 'var(--tk-ok)',
        statusBg: 'var(--tk-ok-soft)',
        statusColor: 'var(--tk-ok-fg)',
        actionLabel: 'Zarządzaj',
        rowBorder: i === connected.length - 1 ? 'transparent' : 'var(--tk-border-2)',
        action: () => this.setState({
          screen: 'billingForm',
          billingDraft: { name: c.name, fields: Object.assign({}, c.fields), editing: c.name },
        }),
      })),
      noTools: connected.length === 0,
      // jedno połączenie naraz — żeby zmienić narzędzie, trzeba rozłączyć obecne
      canConnect: connected.length === 0,
      hasTool: connected.length > 0,
      newTool: () => {
        if (connected.length) return;
        this.setState({ screen: 'billingPick', billingDraft: { name: '', fields: {}, editing: null } });
      },
      toolOptions: BILLING_TOOLS.map((t) => {
        const mine = connected.some((c) => c.name === t.name);
        const blocked = !mine && connected.length > 0;
        return {
          name: t.name, note: t.note, mark: t.mark, logo: t.logo, hasLogo: !!t.logo, noLogo: !t.logo,
          isConnected: mine,
          isFree: !mine && !blocked,
          isBlocked: blocked,
          rowOpacity: blocked ? '0.5' : '1',
          rowCursor: blocked ? 'not-allowed' : 'pointer',
          rowPointer: blocked ? 'none' : 'auto',
        };
      }),
      // podpowiedź prowadzi do tego samego formularza, tylko z krokiem zakładania konta
      startWithSignup: () => this.setState({
        screen: 'billingForm',
        billingDraft: { name: 'Fakturownia', fields: {}, editing: null, signup: true },
      }),
      pickTool: (e) => {
        const name = e.currentTarget.dataset.tool;
        const existing = connected.filter((c) => c.name === name)[0];
        if (!existing && connected.length) return;
        this.setState({
          screen: 'billingForm',
          billingDraft: {
            name: name,
            fields: existing ? Object.assign({}, existing.fields) : {},
            editing: existing ? name : null,
          },
        });
      },
      form: {
        title: bDraft.name || 'Połącz narzędzie',
        cta: bDraft.editing ? 'Zapisz połączenie' : 'Połącz narzędzie',
        isEdit: !!bDraft.editing,
        steps: this.billingSteps(bDraft),
      },
      // „Połącz" nie zapisuje od razu — najpierw sprawdzamy połączenie
      saveTool: () => {
        if (!bDraft.name) return;
        const cur = connected.filter((c) => c.name === bDraft.editing)[0];
        const row = { name: bDraft.name, date: cur ? cur.date : '21.08.2026', fields: Object.assign({}, bDraft.fields) };
        this.runBillingCheck(row, !!bDraft.editing);
      },
      check: this.billingCheckVals(),
      disconnectTool: () => this.setState({
        connectedBilling: connected.filter((c) => c.name !== bDraft.editing),
        screen: 'billing',
      }),
      closeToolFlow: () => {
        const back = s.fvAfterBilling;
        this.setState({ screen: back ? back.screen : 'billing', fvAfterBilling: null });
      },
      backToSettings: () => this.setState({ screen: 'settings', billingEdit: null, garageDraft: null }),
    };
  }

  // ——— Szczegóły dotyczące warsztatu ———
  garagePatch(patch) {
    this.setState((st) => ({ garageDraft: Object.assign({}, st.garageDraft, patch) }));
  }

  garageHoursPatch(dayKey, patch) {
    this.setState((st) => {
      const h = (st.garageDraft && st.garageDraft.hours) || {};
      return {
        garageDraft: Object.assign({}, st.garageDraft, {
          hours: Object.assign({}, h, { [dayKey]: Object.assign({}, h[dayKey], patch) }),
        }),
      };
    });
  }

  garageDuration(d) {
    if (!d || !d.open || !d.from || !d.to) return '';
    const m = (t) => Number(t.split(':')[0]) * 60 + Number(t.split(':')[1]);
    const diff = Math.round((m(d.to) - m(d.from)) / 60);
    return diff > 0 ? diff + ' ' + godzinPL(diff) : '';
  }

  garageVals() {
    const s = this.state;
    const g = s.garage || GARAGE_SEED;
    const f = s.garageDraft || {};
    const openDraft = (modal) => () => this.setState({
      garageModal: modal,
      garageDraft: JSON.parse(JSON.stringify(s.garage || GARAGE_SEED)),
    });
    const openEditor = (screen) => () => this.setState({
      garageEdit: screen,
      garageSelect: null,
      garageDraft: JSON.parse(JSON.stringify(s.garage || GARAGE_SEED)),
    });
    const close = () => this.setState({ garageModal: null, garageEdit: null, garageDraft: null, garageSelect: null });
    const save = (keys, msg) => () => {
      this.setState((st) => {
        const next = Object.assign({}, st.garage);
        keys.forEach((k) => { next[k] = (st.garageDraft || {})[k]; });
        return { garage: next, garageModal: null, garageEdit: null, garageDraft: null, garageSelect: null };
      });
      this.ziloToast(msg || 'Zmiany zapisane pomyślnie');
    };
    const field = (key) => (e) => this.garagePatch({ [key]: e.target.value });
    const flip = (key) => () => this.garagePatch({ [key]: !f[key] });
    const box = (on) => ({
      checked: on ? 'true' : 'false',
      bg: on ? 'var(--tk-brand)' : 'var(--tk-surface)',
      border: on ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      tick: on ? 1 : 0,
    });

    // godziny: jeden wpis na dzień, „Od" i „Do" jako listy co 30 minut
    const hourSel = (dayKey, side, value) => {
      const key = dayKey + '|' + side;
      const open = s.garageSelect === key;
      return {
        key, value: value || '', open,
        label: side === 'from' ? 'Od' : 'Do',
        border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
        options: HOURS_30.map((t) => ({
          value: t, dayKey, side,
          selected: t === value,
          bg: t === value ? 'var(--tk-surface-2)' : 'transparent',
        })),
      };
    };

    const days = (src) => DAYS_KEY.map((k, i) => {
      const d = (src.hours || {})[k] || { open: false };
      const dur = this.garageDuration(d);
      return {
        key: k,
        label: DAYS_PL[i],
        isOpen: !!d.open,
        closed: !d.open,
        hours: d.open ? d.from + ' - ' + d.to : 'Zamknięte',
        hoursColor: d.open ? 'var(--tk-text)' : 'var(--tk-text-3)',
        duration: dur,
        hasDuration: !!dur,
        trackBg: d.open ? 'var(--tk-brand)' : 'var(--tk-text-3)',
        knobLeft: d.open ? '22px' : '2px',
        fromSel: hourSel(k, 'from', d.from),
        toSel: hourSel(k, 'to', d.to),
      };
    });

    const platnosc = [g.card && 'Karta', g.cash && 'Gotówka'].filter(Boolean).join(', ');
    return {
      // karta „Dane warsztatu"
      name: g.name, phone: g.phone, email: g.email,
      editDetails: openEditor('details'),
      // karta „Adres warsztatu"
      street: g.street,
      cityLine: g.city + (g.quarter ? ', ' + g.quarter : ''),
      zip: g.zip,
      editContact: openEditor('contact'),
      // karta „Godziny otwarcia"
      week: days(g),
      editHours: openEditor('hours'),
      // karta „Logo"
      hasLogo: !!g.logo,
      noLogo: !g.logo,
      logo: g.logo || '',
      editLogo: openDraft('logo'),
      // karta „Dodatkowe informacje"
      platnosc: platnosc || 'Nie wybrano',
      czesciKlienta: 'Warsztat ' + (g.useClientParts ? '' : 'nie ') + 'pracuje na częściach klienta',
      editExtra: openDraft('extra'),

      // pełny ekran „Dane warsztatu" — dane podstawowe + dane firmy
      detailsOpen: s.garageEdit === 'details',
      dName: f.name || '', setName: field('name'),
      dPhone: f.phone || '', setPhone: field('phone'),
      dEmail: f.email || '', setEmail: field('email'),
      saveDetails: save(['name', 'phone', 'email']),

      // modal „Szczegóły warsztatu"
      extraOpen: s.garageModal === 'extra',
      cardBox: box(!!f.card), toggleCard: flip('card'),
      cashBox: box(!!f.cash), toggleCash: flip('cash'),
      partsBox: box(!!f.useClientParts), toggleParts: flip('useClientParts'),
      saveExtra: save(['card', 'cash', 'useClientParts']),

      // modal „Logo warsztatu"
      logoOpen: s.garageModal === 'logo',
      draftHasLogo: !!f.logo,
      draftNoLogo: !f.logo,
      draftLogo: f.logo || '',
      pickLogo: () => this.garagePatch({ logo: 'wgrany' }),
      dropLogo: () => this.garagePatch({ logo: '' }),
      saveLogo: save(['logo']),

      // pełny ekran „Edycja danych adresowych warsztatu"
      contactOpen: s.garageEdit === 'contact',
      cStreet: f.street || '', setStreet: field('street'),
      cCity: (f.city || '') + (f.quarter ? ', ' + f.quarter : ''),
      setCity: (e) => {
        const [city, quarter] = String(e.target.value).split(',');
        this.garagePatch({ city: (city || '').trim(), quarter: (quarter || '').trim() });
      },
      cZip: f.zip || '', setZip: field('zip'),
      cDirections: f.directions || '', setDirections: field('directions'),
      saveContact: save(['street', 'city', 'quarter', 'zip', 'directions']),

      // pełny ekran „Edycja godzin otwarcia"
      hoursOpen: s.garageEdit === 'hours',
      draftWeek: days(f),
      toggleDay: (e) => {
        const k = e.currentTarget.dataset.day;
        const cur = ((f.hours || {})[k] || {}).open;
        this.garageHoursPatch(k, { open: !cur });
      },
      toggleHourSel: (e) => {
        const k = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ garageSelect: st.garageSelect === k ? null : k }));
      },
      pickHour: (e) => {
        const d = e.currentTarget.dataset;
        this.garageHoursPatch(d.day, { [d.side]: d.value });
        this.setState({ garageSelect: null });
      },
      saveHours: save(['hours']),

      closeGarageEditor: close,
      backToSettings: () => this.setState({ screen: 'settings', garageEdit: null, garageModal: null, garageDraft: null }),
    };
  }

  setPanels(carId, opts) {
    if (!carId) return [];
    const withDrafts = !opts || opts.drafts !== false;
    const onlyDrafts = !!(opts && opts.onlyDrafts);
    const forms = this.state.visitTireForms || {};
    const openMap = this.state.visitTireOpenMap || {};
    const mkSel = (setKey, field, value, options, label) => {
      const key = setKey + '|' + field;
      const open = this.state.visitTireSelect === key;
      const has = !!value;
      return {
        key, label, value, hasValue: has, open,
        border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
        labelSize: has ? '12px' : '16px',
        labelLine: has ? '16px' : '20px',
        chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
        options: options.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent', ...seasonBits(o) })), ...seasonBits(value),
      };
    };
    const drafts = withDrafts
      ? (this.state.visitTireDrafts || []).map((k) => ({ __draft: true, __key: k }))
      : [];
    const items = drafts.map((dr) => ({ draft: dr }))
      .concat(onlyDrafts ? [] : this.tireSetsFor(carId).map((t) => ({ t })));
    return items.map((it) => {
      const t = it.t || { season: '', wheels: [], note: '', code: '', status: 'in', __idx: -1 };
      const key = it.draft ? it.draft.__key : carId + '::' + t.__idx;
      const f = forms[key] || (it.draft
        ? { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '' }
        : this.buildSetForm(carId, t));
      const expanded = !!openMap[key];
      const season = f.season || t.season;
      const stored = !it.draft && (this.state.setStatus[key] || t.status) === 'in';
      return {
        key,
        title: it.draft ? 'Nowe opony' : 'Opony',
        titleFull: it.draft
          ? 'Nowe opony'
          : ((season || 'Opony') + (t.code ? ' nr. ' + t.code : '')).replace(/\s+/g, ' ').trim(),
        hasCode: !!t.code,
        code: t.code,
        season: season,
        ...seasonBits(season),
        stored,
        expanded,
        arrow: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        note: f.note || '',
        location: f.location !== undefined ? f.location : (t.location || ''),
        hasLocation: !!(f.location !== undefined ? f.location : t.location),
        locPad: (f.location !== undefined ? f.location : t.location) ? '9px 13px 13px 13px' : '20px 13px',
        locPh: (f.location !== undefined ? f.location : t.location) ? '' : 'Lokalizacja',
        locCount: String((f.location !== undefined ? f.location : (t.location || '')).length) + '/40',
        isDraft: !!it.draft,
        emailChecked: f.emailConfirm ? 'true' : 'false',
        emailBg: f.emailConfirm ? 'var(--tk-brand)' : 'var(--tk-surface)',
        emailBorder: f.emailConfirm ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
        emailTick: f.emailConfirm ? 1 : 0,
        seasonSel: mkSel(key, 'season', f.season, ['Zima', 'Lato', 'Całoroczne'], 'Sezon'),
        wheels: f.wheels.map((w) => ({
          id: w.id,
          setKey: key,
          maker: w.maker, size: w.size, tread: w.tread, qty: w.qty,
          sizePad: w.size ? '9px 13px 13px 13px' : '20px 13px', sizePh: w.size ? '' : 'Profil', hasSize: !!w.size,
          treadPad: w.tread ? '9px 13px 13px 13px' : '20px 13px', treadPh: w.tread ? '' : 'Głębokość bieżnika', hasTread: !!w.tread,
          qtyPad: w.qty ? '9px 13px 13px 13px' : '20px 13px', qtyPh: w.qty ? '' : 'Ilość', hasQty: !!w.qty,
          removeOpacity: f.wheels.length > 1 ? 1 : 0.35,
          removeEvents: f.wheels.length > 1 ? 'auto' : 'none',
          makerSel: mkSel(key, 'maker|' + w.id, w.maker, TIRE_MAKERS, 'Producent'),
          rimSel: mkSel(key, 'rim|' + w.id, w.rim, ['Tak', 'Nie'], 'Felga'),
        })),
      };
    });
  }

  visitClientVals() {
    const f = this.state.visitClientForm;
    if (!f) return { open: false, consents: [], cars: [] };
    const consent = (key, on, label) => ({
      key, label,
      checked: on ? 'true' : 'false',
      trackBg: on ? 'var(--tk-brand)' : 'var(--tk-text-3)',
      knobLeft: on ? '25.625px' : '1.625px',
    });
    const inlineTires = false;
    return {
      open: !this.state.tireSectionOpen,
      inv: this.invVals('visitClientForm', 'visit-inv-country'),
      phone: f.phone,
      name: f.name,
      email: f.email,
      groupSel: (() => {
        const open = this.state.openSelect === 'visit-client-group';
        const cur = f.priceGroup || '';
        const has = !!cur;
        const list = (this.state.priceGroups || DEFAULT_PRICE_GROUPS).map((g) => ({
          value: g.name,
          label: g.pct ? g.name + ' · ' + g.pct + '%' : g.name,
        }));
        return {
          key: 'visit-client-group',
          value: cur,
          hasValue: has,
          open: open,
          border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
          bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
          labelSize: has ? '12px' : '16px',
          labelLine: has ? '16px' : '20px',
          chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
          chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
          options: list.map((o) => ({
            value: o.value, label: o.label,
            selected: o.value === cur,
            bg: o.value === cur ? 'var(--tk-surface-2)' : 'transparent',
          })),
        };
      })(),
      consents: [
        consent('sms', f.sms, 'Czy klient wyraził zgodę na otrzymywanie SMS-ów/telefonów z ofertami i treściami marketingowymi?'),
        consent('mail', f.mail, 'Czy klient wyraził zgodę na otrzymywanie E-maili z ofertami i treściami marketingowymi?'),
        consent('opinion', f.opinion, 'Czy klient wyraził zgodę na otrzymywanie maili i SMS-ów z prośbą o pozostawienie opinii na portalu DobryMechanik.pl?'),
      ],
      cars: f.cars.map((c) => {
        const sel = (key, value, options, label) => {
          const open = this.state.visitCarSelect === key + '::' + c.id;
          const has = !!value;
          return {
            key: key + '::' + c.id, label, value, hasValue: has, open,
            border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
            bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
            labelSize: has ? '12px' : '16px',
            labelLine: has ? '16px' : '20px',
            chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
            chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
            options: options.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent' })),
          };
        };
        const YRS = []; for (let y = 2026; y >= 1990; y -= 1) YRS.push(String(y));
        const selected = c.id === f.selectedCarId;
        const many = f.cars.length > 1;
        const openMap = this.state.visitCarOpen || {};
        const expanded = many ? !!openMap[c.id] : openMap[c.id] !== false;
        return {
          id: c.id,
          title: (c.brand + ' ' + c.model).trim() || 'Nowy pojazd',
          plate: c.plate || '',
          vin: c.vin || '',
          engine: c.engine || '',
          removable: f.cars.length > 1,
          expanded,
          arrowRotate: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          radioBorder: selected ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
          radioBg: selected ? 'radial-gradient(circle, var(--tk-brand) 0 45%, var(--tk-surface) 46% 100%)' : 'var(--tk-surface)',
          selectsRow1: [
            sel('brand', c.brand, Object.keys(BRANDS), 'Marka*'),
            sel('model', c.model, BRANDS[c.brand] || [], 'Model*'),
          ],
          selectsRow2: [sel('year', c.year, YRS, 'Rok produkcji (opcjonalnie)')],
          tiresInline: inlineTires,
          tiresInlineOn: inlineTires && !!this.state.tireStorageOn,
          sets: inlineTires ? this.setPanels(c.id, { drafts: c.id === f.selectedCarId }) : [],
        };
      }),
    };
  }

  timeEditVals() {
    const f = this.state.timeForm;
    if (!f) return { open: false, workspaces: [], hourSelects: [], calDays: [], calWeekdays: [] };
    const ws = WS.find((w) => w.id === f.wsId) || WS[0];
    const DOW = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz'];
    const MON_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
    const MON_FULL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    const [sy, sm, sd] = f.date.split('-').map(Number);
    const cur = f.calMonth || { y: sy, m: sm - 1 };
    const lead = (new Date(cur.y, cur.m, 1).getDay() + 6) % 7;
    const dim = new Date(cur.y, cur.m + 1, 0).getDate();
    const pad = (n) => String(n).padStart(2, '0');
    const days = [];
    for (let i = 0; i < lead; i += 1) days.push({ label: '', value: '', visibility: 'hidden', bg: 'transparent', color: 'var(--tk-text)' });
    for (let d = 1; d <= dim; d += 1) {
      const value = cur.y + '-' + pad(cur.m + 1) + '-' + pad(d);
      const isSel = value === f.date;
      const isToday = value === '2026-08-13';
      days.push({
        label: String(d), value, visibility: 'visible',
        bg: isSel ? 'var(--tk-brand)' : (isToday ? 'var(--tk-info)' : 'transparent'),
        color: isSel || isToday ? 'var(--tk-on-fill)' : 'var(--tk-text)',
      });
    }
    const hours = [];
    for (let h = 6; h <= 20; h += 1) for (const m of ['00', '15', '30', '45']) hours.push(pad(h) + ':' + m);
    const selDate = new Date(sy, sm - 1, sd);
    const hourSel = (key, label, value, list) => {
      const open = this.state.timeSelect === key;
      return {
        key, label, value,
        open,
        border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
        bodyPad: open ? '8px 12px' : '9px 13px 13px 13px',
        chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
        chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
        options: list.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent' })),
      };
    };
    const dateOpen = this.state.timeDateOpen;
    return {
      open: true,
      wsName: ws.title,
      wsBg: ws.color,
      wsBorder: ws.border,
      wsText: ws.text,
      wsOpen: this.state.wsDropdownOpen,
      wsChevron: this.state.wsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      workspaces: WS.map((w) => ({
        id: w.id, title: w.title, bg: w.color, border: w.border, text: w.text, selected: w.id === f.wsId,
      })),
      dateLabel: DOW[(selDate.getDay() + 6) % 7] + ', ' + sd + ' ' + MON_SHORT[sm - 1] + ' ' + sy,
      dateOpen,
      dateBorder: dateOpen ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
      datePad: dateOpen ? '8px 12px' : '9px 13px 13px 13px',
      dateIconColor: dateOpen ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
      calTitle: MON_FULL[cur.m] + ' ' + cur.y,
      calWeekdays: DOW.map((d) => ({ label: d })),
      calDays: days,
      hourSelects: [hourSel('from', 'Od', f.from, hours), hourSel('to', 'Do', f.to, hours.filter((h) => h > f.from))],
      notifyChecked: f.notify ? 'true' : 'false',
      notifyBg: f.notify ? 'var(--tk-brand)' : 'var(--tk-surface)',
      notifyBorder: f.notify ? '1.5px solid var(--tk-brand-bd)' : '1.5px solid var(--tk-border-strong)',
      notifyTick: f.notify ? 1 : 0,
    };
  }

  visitCarId() {
    const ev = this.state.events.find((e) => e.id === this.state.eventId);
    if (!ev) return null;
    const client = CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate));
    const car = client ? client.cars.find((c) => c.plate === ev.plate) : null;
    return car ? car.id : null;
  }

  // wydanie kompletu działa tak samo, tylko wie, o który komplet chodzi
  openReleaseFor(setKey) {
    if (!setKey) return;
    const carId = this.visitCarId();
    const sets = carId ? this.tireSetsFor(carId) : [];
    const hasOther = sets.some((t) => (carId + '::' + t.__idx) !== setKey);
    this.setState({
      releaseSelect: null,
      releaseForm: { setKey: setKey, outOpen: false, choice: hasOther ? 'existing' : 'new', newSeason: '', newMaker: '', newQty: '4', newSize: '', newRim: '', newTread: '', newLocation: '', note: '' },
    });
  }

  visitTireTable() {
    const s = this.state;
    const carId = this.visitCarId();
    const on = !!s.tireStorageOn;
    const sets = carId
      ? this.tireSetsFor(carId).filter((t) => (s.setStatus[carId + '::' + t.__idx] || t.status) === 'in')
      : [];
    const openMap = s.vtRowOpen || {};
    return {
      on: on && !!carId,
      has: on && sets.length > 0,
      hasOn: on && sets.length > 0,
      empty: on && !!carId && sets.length === 0,
      emptyOn: on && !!carId && sets.length === 0,
      count: String(sets.length),
      sectionOpen: !!(s.vtSectionOpen || {})[s.eventId],
      sectionArrow: (s.vtSectionOpen || {})[s.eventId] ? 'rotate(180deg)' : 'rotate(0deg)',
      toggleSection: () => this.setState((st) => ({
        vtSectionOpen: Object.assign({}, st.vtSectionOpen, { [st.eventId]: !(st.vtSectionOpen || {})[st.eventId] }),
      })),
      rows: sets.map((t, i) => {
        const key = carId + '::' + t.__idx;
        const expanded = !!openMap[key];
        const spec = this.specRows(t.wheels);
        const anyTread = spec.some((r) => !!r.tread);
        return Object.assign({
          key: key,
          season: t.season,
          code: t.code,
          location: t.location || '—',
          received: t.received || '—',
          rowBorder: i === sets.length - 1 ? 'transparent' : 'var(--tk-border-2)',
          expanded: expanded,
          arrow: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          toggle: () => this.setState((st) => ({
            vtRowOpen: Object.assign({}, st.vtRowOpen, { [key]: !(st.vtRowOpen || {})[key] }),
          })),
          hasNote: !!t.note,
          note: t.note || '',
          hasLocation: !!t.location,
          locationText: t.location || '',
          hasFiles: (t.files || []).length > 0,
          hasMeta: !!t.location || !!t.note || (t.files || []).length > 0,
          files: (t.files || []).map((f, fi) => ({
            key: key + '-' + fi,
            isDoc: f === 'doc',
            isPhoto: f !== 'doc',
          })),
          specCols: anyTread ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
          hasTread: anyTread,
          wheels: spec.map((r, wi) => ({
            maker: r.maker || '—',
            size: r.size || '—',
            rim: r.rim || '—',
            tread: r.tread || '—',
            showTread: anyTread,
            qty: String(r.qty),
            cols: anyTread ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
            rowBorder: wi === spec.length - 1 ? 'transparent' : 'var(--tk-border-2)',
          })),
          release: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.openReleaseFor(key); },
        }, seasonVals(t.season));
      }),
    };
  }

  visitTireVals() {
    const carId = this.visitCarId();
    const sets = carId ? this.tireSetsFor(carId).filter((t) => (this.state.setStatus[carId + '::' + t.__idx] || t.status) === 'in') : [];
    const on = !!this.state.tireStorageOn;
    const t = sets[0];
    if (!t) return { has: false, hasOn: false, empty: !!carId, emptyOn: on && !!carId, wheels: [] };
    return {
      has: true,
      hasOn: on,
      empty: false,
      emptyOn: false,
      setKey: carId + '::' + t.__idx,
      season: t.season,
      code: t.code,
      ...seasonVals(t.season),
      open: this.state.visitTireOpen,
      menuOpen: !!this.state.visitTireMenuOpen,
      tipVisible: !!this.state.visitTireTip,
      tipMeta: 'Przyjęto: ' + t.received,
      tipHasLocation: !!t.location,
      tipLocation: t.location || '',
      tipCols: this.specRows(t.wheels).some((r) => !!r.tread) ? 'auto auto auto auto auto' : 'auto auto auto auto',
      tipHasTread: this.specRows(t.wheels).some((r) => !!r.tread),
      tipWheels: (() => {
        const rows = this.specRows(t.wheels);
        const anyTread = rows.some((r) => !!r.tread);
        return rows.map((r, wi) => ({
          maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
          tread: r.tread || '—', showTread: anyTread,
          rowBorder: wi === 0 ? 'transparent' : 'var(--tk-border-2)',
        }));
      })(),
      hasLocation: !!t.location,
      location: t.location || '',
      wheels: t.wheels.map((w) => ({ pos: w.pos, maker: w.maker, size: w.size, rim: w.rim, tread: w.tread })),
    };
  }

  buildSetForm(carId, t) {
    const toIso = (pl) => {
      const [d, m, y] = String(pl).split('.');
      return y ? y + '-' + m + '-' + d : '2026-08-13';
    };
    return {
      key: carId + '::' + t.__idx,
      season: t.season,
      date: toIso(t.received),
      wheels: this.specRows(t.wheels).map((r, i) => ({
        id: 'w' + t.__idx + '_' + i,
        rim: r.rim === '—' ? '' : r.rim,
        maker: r.maker === '—' ? '' : r.maker,
        size: r.size === '—' ? '' : r.size,
        tread: r.tread || '',
        qty: String(r.qty),
      })),
      note: t.note || '',
      location: t.location || '',
      code: t.code || '',
      files: (t.files || []).slice(),
      emailConfirm: false,
    };
  }

  openEditFromKey(key) {
    const [carId] = key.split('::');
    const sets = this.tireSetsFor(carId);
    const panels = sets.map((t) => this.buildSetForm(carId, t));
    const active = panels.find((p) => p.key === key);
    if (!active) return;
    this.setState({
      tireSelect: null,
      tireDateOpen: false,
      tireForm: { carId, editKey: key, panels, ...active, block: { maker: '', size: '', tread: '', qty: '', rim: '' }, sameAll: true },
    });
  }

  specRows(wheels) {
    const rows = [];
    (wheels || []).forEach((w) => {
      const key = [w.maker, w.size, w.rim, w.tread].join('|');
      const found = rows.find((r) => r.key === key);
      const n = Number(w.qty) || 1;
      if (found) found.qty += n;
      else rows.push({ key, maker: w.maker || '—', size: w.size || '—', rim: w.rim || '—', tread: w.tread || '', qty: n });
    });
    return rows;
  }

  supplierSteps(draft) {
    const sup = SUPPLIERS.filter((x) => x.name === draft.name)[0];
    if (!sup) return [];
    const fields = draft.fields || {};
    return sup.steps.map((st, i) => ({
      no: String(i + 1),
      title: st.title,
      border: i === sup.steps.length - 1 ? 'transparent' : 'var(--tk-border-2)',
      hasInfo: !!st.info,
      infoLabel: st.info || '',
      infoValue: st.infoValue || '',
      hasField: !!st.field,
      fieldLabel: st.label || '',
      value: fields[st.field] || '',
      field: this.dsFieldState(fields[st.field]),
      hasHint: !!st.hint,
      hint: st.hint || '',
      setValue: (e) => {
        const v = e.target.value;
        const cur = this.state.supplierDraft || { name: draft.name, fields: {}, editing: draft.editing };
        this.setState({
          supplierDraft: Object.assign({}, cur, { fields: Object.assign({}, cur.fields, { [st.field]: v }) }),
        });
      },
    }));
  }

  refAppointments() {
    return null;
  }

  assignDaysFromRef(list) {
    const q = (this.state.assignQuery || '').toLowerCase();
    const pick = this.state.assignPick;
    const wsFilter = this.state.assignWs || 'all';
    const STATION = {
      'Opony i wulkanizacja': { id: 'w3', bg: 'var(--tk-info-soft)', bar: 'var(--tk-info)', tc: 'var(--tk-info-fg)' },
      'Mechanika ogólna': { id: 'w1', bg: 'var(--tk-ok-soft)', bar: 'var(--tk-ok)', tc: 'var(--tk-ok-fg)' },
      'Serwis klimatyzacji': { id: 'w2', bg: 'var(--tk-cyan-soft)', bar: 'var(--tk-cyan)', tc: 'var(--tk-cyan-fg)' },
      'Myjnia': { id: 'w4', bg: 'var(--tk-warn-soft)', bar: 'var(--tk-warn)', tc: 'var(--tk-warn-fg)' },
    };
    const STATUS = {
      'umowione': { name: 'Umówione', color: 'var(--tk-info)', bg: 'var(--tk-brand-soft)', dot: 'var(--tk-info)' },
      'w-trakcie': { name: 'W trakcie', color: 'var(--tk-brand-fg)', bg: 'var(--tk-brand-soft)', dot: 'var(--tk-brand-fg)' },
      'naprawione': { name: 'Naprawione', color: 'var(--tk-ok)', bg: 'var(--tk-ok-soft)', dot: 'var(--tk-ok)' },
      'wydane': { name: 'Wydane', color: 'var(--tk-text-2)', bg: 'var(--tk-surface-3)', dot: 'var(--tk-text-3)' },
    };
    const pad = (t) => (String(t).length === 4 ? '0' + t : String(t));
    const dayKey = (d) => {
      const dt = d instanceof Date ? d : new Date(d);
      return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2);
    };
    const now = new Date();
    const todayKey = dayKey(now);
    const buckets = {};
    list.forEach((a) => {
      const station = STATION[a.stanowisko] || STATION['Mechanika ogólna'];
      if (wsFilter !== 'all' && station.id !== wsFilter) return;
      const hay = ((a.name || '') + ' ' + (a.desc || '') + ' ' + (a.stanowisko || '') + ' ' + (a.phone || '')).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      const k = dayKey(a.date);
      const dow = new Date(k + 'T00:00:00').getDay();
      if (dow === 0 || dow === 6) return;
      (buckets[k] = buckets[k] || []).push({ a: a, station: station });
    });
    return Object.keys(buckets).sort().map((k) => {
      const dt = new Date(k + 'T00:00:00');
      const isToday = k === todayKey;
      const rows = buckets[k].sort((x, y) => pad(x.a.start).localeCompare(pad(y.a.start)));
      return {
        key: isToday ? 'today' : k,
        label: (isToday ? 'Dziś • ' : '') + WD_FULL[(dt.getDay() + 6) % 7] + ' ' + dt.getDate() + ' ' + MONTHS_NOM[dt.getMonth()],
        color: isToday ? 'var(--tk-brand-fg)' : 'var(--tk-text)',
        count: String(rows.length),
        visits: rows.map(({ a, station }) => {
          const st = STATUS[a.status] || STATUS['umowione'];
          const on = pick === a.id;
          return {
            id: a.id,
            tc: station.tc,
            opacity: a.status === 'wydane' ? '0.5' : '1',
            time: pad(a.start) + '–' + pad(a.end),
            car: a.name,
            reason: a.desc || '',
            status: st.name,
            stColor: st.color,
            stBg: st.bg,
            stDot: st.dot,
            bar: station.bar,
            bg: station.bg,
            ring: on ? '2px' : '0px',
            radioBorder: on ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
            radioBg: on ? 'radial-gradient(var(--tk-brand) 0 5px, transparent 6px), var(--tk-surface)' : 'var(--tk-surface)',
            pick: () => this.setState({ assignPick: a.id, assignPickLabel: a.name + ' · ' + pad(a.start) }),
          };
        }),
      };
    });
  }

  assignDays() {
    const ref = this.refAppointments();
    if (ref) return this.assignDaysFromRef(ref);
    const q = (this.state.assignQuery || '').toLowerCase();
    const pick = this.state.assignPick;
    const wsFilter = this.state.assignWs || 'all';
    const ALLOWED = ['w1', 'w2', 'w3'];
    const todayIdx = WEEK.indexOf(TODAY);
    const days = [];
    WEEK.concat(['2026-08-17']).forEach((date, di) => {
      const dow = new Date(date).getDay();
      if (dow === 0 || dow === 6) return;
      const visits = EVENTS.filter((ev) => ev.d === di)
        .filter((ev) => ALLOWED.indexOf(ev.ws) !== -1)
        .filter((ev) => wsFilter === 'all' || ev.ws === wsFilter)
        .filter((ev) => !q
        || (ev.brand + ' ' + ev.model).toLowerCase().indexOf(q) !== -1
        || ev.plate.toLowerCase().indexOf(q) !== -1
        || (ev.client || '').toLowerCase().indexOf(q) !== -1
        || (ev.reason || '').toLowerCase().indexOf(q) !== -1);
      if (!visits.length) return;
      const dayNo = Number(date.slice(8, 10));
      const month = MONTHS[Number(date.slice(5, 7)) - 1];
      const rel = di === todayIdx ? 'Dziś · ' : (di === todayIdx + 1 ? 'Jutro · ' : '');
      days.push({
        key: di === todayIdx ? 'today' : String(di),
        label: (di === todayIdx ? 'Dziś • ' : rel) + WD_FULL[(new Date(date).getDay() + 6) % 7] + ' ' + dayNo + ' ' + MONTHS_NOM[Number(date.slice(5, 7)) - 1],
        color: di === todayIdx ? 'var(--tk-brand-fg)' : 'var(--tk-text)',
        count: String(visits.length),
        visits: visits.sort((a, b) => toMin(a.t) - toMin(b.t)).map((ev) => {
          const st = ST[ev.st] || ST.nowa;
          const ws = WS.filter((x) => x.id === ev.ws)[0] || WS[0];
          const on = pick === ev.id;
          return {
            id: ev.id,
            tc: ws.text,
            opacity: ev.st === 'wydane' ? '0.5' : '1',
            time: ev.t + '–' + fromMin(toMin(ev.t) + ev.dur),
            car: ev.brand + ' ' + ev.model,
            reason: ev.reason || '',
            status: st.name,
            stColor: st.color,
            stBg: st.bg,
            stDot: st.dot,
            bar: ws.border,
            bg: ws.color,
            ring: on ? '2px' : '0px',
            radioBorder: on ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
            radioBg: on ? 'radial-gradient(var(--tk-brand) 0 5px, transparent 6px), var(--tk-surface)' : 'var(--tk-surface)',
            pick: () => this.setState({ assignPick: ev.id }),
          };
        }),
      });
    });
    return days;
  }

  // wybór pracownika w wierszu — ten sam w usługach i w towarach
  rowPersonVals(key, seed) {
    const s = this.state;
    const picked = (s.rowPeople || {})[key];
    const personName = picked !== undefined ? picked : (seed || '');
    return {
      togglePeople: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ rowPeopleMenu: st.rowPeopleMenu === key ? null : key }));
      },
      peopleOpen: s.rowPeopleMenu === key,
      personBorder: s.rowPeopleMenu === key ? 'var(--tk-brand-bd)' : 'var(--tk-border)',
      person: personName || '— brak —',
      personColor: personName ? 'var(--tk-text)' : 'var(--tk-text-2)',
      hasPerson: !!personName,
      initials: String(personName || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase(),
      peopleOptions: [{ id: '', name: '— brak —', initials: '' }].concat(PEOPLE).map((p) => ({
        name: p.name,
        initials: p.initials,
        hasAvatar: !!p.id,
        bg: personName === (p.id ? p.name : '') ? 'var(--tk-surface-2)' : 'transparent',
        color: p.id ? 'var(--tk-text)' : 'var(--tk-text-2)',
        pick: (e) => {
          e.stopPropagation();
          this.setState((st) => ({
            rowPeople: Object.assign({}, st.rowPeople, { [key]: p.id ? p.name : '' }),
            rowPeopleMenu: null,
          }));
        },
      })),
    };
  }

  qnum(v) {
    const n = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  qcalc(r) {
    const q = this.qnum(r.qty), c = this.qnum(r.cena), rb = this.qnum(r.rabat), v = this.qnum(r.vat);
    const base = q * c;
    const net = base - base * (rb / 100);
    return { net: net, gross: net * (1 + v / 100) };
  }

  quoteRows(st) {
    const uslugi = [], towary = [];
    if (st && Array.isArray(st.groups)) {
      st.groups.forEach((g) => {
        const r = g.robocizna || {};
        uslugi.push({ name: r.name, person: r.person || r.osoba || '', czas: r.czas || '', c: this.qcalc(r) });
        (g.towars || []).forEach((t) => towary.push({ name: t.name, doc: t.doc || '', c: this.qcalc(t) }));
      });
    } else if (st && Array.isArray(st.robociznas)) {
      st.robociznas.forEach((r) => uslugi.push({ name: r.name, person: r.person || r.osoba || '', czas: r.czas || '', c: this.qcalc(r) }));
      (st.towars || []).forEach((t) => towary.push({ name: t.name, doc: t.doc || '', c: this.qcalc(t) }));
    }
    return { uslugi: uslugi, towary: towary };
  }

  removeQuoteRow(visitId, kind, idx) {
    this.setState((prev) => {
      const q = (prev.quotes || {})[visitId];
      if (!q || !q.state) return null;
      const st = JSON.parse(JSON.stringify(q.state));
      const without = (list) => (list || []).filter((x, k) => k !== idx);
      if (Array.isArray(st.groups)) {
        if (kind === 'usluga') {
          let i = 0;
          st.groups = st.groups.filter((g) => (g.robocizna ? i++ !== idx : true));
        } else {
          let seen = 0;
          st.groups = st.groups.map((g) => {
            const n = (g.towars || []).length;
            const hit = idx >= seen && idx < seen + n;
            const local = idx - seen;
            seen += n;
            return hit ? Object.assign({}, g, { towars: (g.towars || []).filter((x, k) => k !== local) }) : g;
          });
        }
      } else if (kind === 'usluga') {
        st.robociznas = without(st.robociznas);
      } else {
        st.towars = without(st.towars);
      }
      return { quotes: Object.assign({}, prev.quotes, { [visitId]: Object.assign({}, q, { state: st }) }) };
    });
  }

  removeVisitPart(visitId, idx) {
    this.setState((prev) => {
      const list = (prev.visitParts || {})[visitId] || [];
      return { visitParts: Object.assign({}, prev.visitParts, { [visitId]: list.filter((x, k) => k !== idx) }) };
    });
  }

  visitPeopleIds() {
    return (this.state.assignedByVisit || {})[this.state.eventId] || [];
  }

  wycVals(ev) {
    const s = this.state;
    const id = ev && ev.id;
    const saved = (s.quotes || {})[id] || null;
    const rows = saved ? this.quoteRows(saved.state) : { uslugi: [], towary: [] };
    const parts = ((s.visitParts || {})[id] || []).map((p) => ({
      name: p.name,
      doc: p.doc || p.docNr || '',
      c: { net: this.qnum(p.net), gross: this.qnum(p.gross) },
    }));
    const goods = rows.towary.concat(parts);
    const towaryCount = rows.towary.length;
    // Konfigurator zawsze trzyma jeden pusty wiersz zalążkowy. To nie jest pozycja
    // wyceny — nie ma nazwy, kwoty ani czasu — więc nie pokazujemy go w szczegółach.
    const pustaUsluga = (r) => !String(r.name || '').trim() && !String(r.person || '').trim() && !r.c.net && !r.c.gross && !this.qnum(r.czas);
    const pustyTowar = (g) => !String(g.name || '').trim() && !g.c.net && !g.c.gross;
    // indeks źródłowy trzeba zachować — służy do usuwania właściwego wiersza
    const uslugiList = rows.uslugi.map((r, i) => ({ r, i })).filter((x) => !pustaUsluga(x.r));
    const goodsList = goods.map((g, i) => ({ g, i })).filter((x) => !pustyTowar(x.g));
    const hasQuote = !!saved || goods.length > 0;
    const initials = (n) => String(n || '').trim().split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase();
    const sum = (list, k) => list.reduce((a, x) => a + (x.c[k] || 0), 0);
    const uN = sum(rows.uslugi, 'net'), uB = sum(rows.uslugi, 'gross');
    const tN = sum(goods, 'net'), tB = sum(goods, 'gross');
    const hist = (s.offerHistory || {})[id] || [];
    const fvHist = (s.fvHistory || {})[id] || [];
    return {
      title: 'Usługi i towary',
      hasQuote: true,
      empty: false,
      servicesOverflow: s.rowPeopleMenu ? 'visible' : 'auto',
      services: uslugiList.map(({ r, i: ri }) => {
        const key = id + ':' + ri;
        const menu = this.rowPersonVals(key, (r && r.person) || '');
        const czas = this.qnum(r.czas);
        return Object.assign(menu, {
        openName: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: ri, field: 'name' }); },
        openPerson: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: ri, field: 'person' }); },
        openNet: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: ri, field: 'netto' }); },
        openGross: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: ri, field: 'brutto' }); },
        name: r.name && r.name.trim() ? r.name : '—',
        nameColor: 'var(--tk-text)',
        hasPersonLabel: true,
        // «Przeprac. czas» z konfiguratora — nie wpływa na kwoty, służy rozliczeniu pracownika
        time: czas > 0 ? String(r.czas).replace('.', ',') + ' h' : '—',
        timeColor: czas > 0 ? 'var(--tk-text)' : 'var(--tk-text-3)',
        openTime: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: ri, field: 'czas' }); },
        net: this.moneyPl(r.c.net),
        gross: this.moneyPl(r.c.gross),
        remove: () => this.removeQuoteRow(id, 'usluga', ri),
      });
      }),
      goods: goodsList.map(({ g, i: gi }) => ({
        openName: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: gi, field: 'towar' }); },
        doc: g.doc || '',
        docColor: g.doc ? 'var(--tk-text-2)' : 'var(--tk-text-3)',
        openNet: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: gi, field: 'netto' }); },
        openGross: (e) => { e.stopPropagation(); this.openWycConfig(id, { index: gi, field: 'brutto' }); },
        name: g.name && String(g.name).trim() ? g.name : '—',
        nameColor: 'var(--tk-text)',
        net: this.moneyPl(g.c.net),
        gross: this.moneyPl(g.c.gross),
        remove: () => (gi < towaryCount
          ? this.removeQuoteRow(id, 'towar', gi)
          : this.removeVisitPart(id, gi - towaryCount)),
      })),
      noGoods: goodsList.length === 0,
      servicesNet: this.moneyPl(uN),
      servicesGross: this.moneyPl(uB),
      goodsNet: this.moneyPl(tN),
      goodsGross: this.moneyPl(tB),
      sumNet: this.moneyPl(uN + tN),
      sumGross: this.moneyPl(uB + tB),
      openConfig: () => this.openWycConfig(id),
      addUsluga: () => this.openWycConfig(id, { field: 'name' }),
      addTowar: () => this.openWycConfig(id, { field: 'towar' }),
      sendOffer: () => this.openOfferConfig(id),
      downloadPdf: () => this.ziloToast('Kosztorys pobrany jako PDF'),
      issueFv: () => this.openInvoiceConfig(id),
      previewOffer: () => this.openWycConfig(id, null, { preview: true }),
      hasFvHistory: fvHist.length > 0,
      fvHistoryCount: String(fvHist.length),
      fvHistoryOpen: s.fvHistoryOpen !== false,
      fvHistoryArrow: s.fvHistoryOpen === false ? 'rotate(0deg)' : 'rotate(180deg)',
      toggleFvHistory: () => this.setState((st) => ({ fvHistoryOpen: st.fvHistoryOpen === false })),
      fvHistory: fvHist.map((h, i) => {
        const tone = (label) => (label === 'Opłacona'
          ? { bg: 'var(--tk-ok-soft)', color: 'var(--tk-ok-fg)' }
          : (label === 'Częściowo opłacona' ? { bg: 'var(--tk-warn-soft)', color: 'var(--tk-warn-fg)' } : { bg: 'var(--tk-brand-soft)', color: 'var(--tk-brand-fg)' }));
        const cur = tone(h.status);
        return {
          numer: h.numer,
          buyer: h.buyer,
          date: h.date,
          status: h.status,
          statusBg: cur.bg,
          statusColor: cur.color,
          ksef: h.ksef || 'Do wysyłki',
          ksefBg: ksefTone(h.ksef || 'Do wysyłki').bg,
          ksefColor: ksefTone(h.ksef || 'Do wysyłki').color,
          openInBilling: () => this.openBilling(h.numer),
          amt: h.amt,
          border: i === fvHist.length - 1 ? 'transparent' : 'var(--tk-border-2)',
          flashAnim: s.fvFlash === id + ':' + i ? 'zFlash 2.4s cubic-bezier(.2,0,0,1)' : 'none',
          flashMark: s.fvFlash === id + ':' + i ? '1' : '0',
        };
      }),
      hasHistory: hist.length > 0,
      historyCount: String(hist.length),
      historyOpen: s.historyOpen !== false,
      historyArrow: s.historyOpen === false ? 'rotate(0deg)' : 'rotate(180deg)',
      toggleHistory: () => this.setState((st) => ({ historyOpen: st.historyOpen === false })),
      history: hist.map((h, i) => {
        const tone = (label) => (label === 'Zaakceptowana'
          ? { bg: 'var(--tk-ok-soft)', color: 'var(--tk-ok-fg)' }
          : (label === 'Odrzucona' ? { bg: 'var(--tk-danger-soft)', color: 'var(--tk-danger-fg)' } : { bg: 'var(--tk-warn-soft)', color: 'var(--tk-warn-fg)' }));
        const cur = tone(h.status);
        const isFlash = s.offerFlash === id + ':' + i;
        return {
          date: h.date,
          status: h.status,
          statusColor: cur.color,
          statusBg: cur.bg,
          flashAnim: isFlash ? 'zFlash 2.4s cubic-bezier(.2,0,0,1)' : 'none',
          flashMark: isFlash ? '1' : '0',
          issueFv: () => this.openInvoiceConfig(id, { uslugi: h.uslugi, towary: h.towary }),
          // przywrócenie wrzuca pozycje tej oferty z powrotem do wyceny wizyty
          restoreOffer: () => {
            this.setState((st) => {
              const q = (st.quotes || {})[id] || {};
              const prev = q.state || {};
              const next = Object.assign({}, prev, {
                groups: null,
                robociznas: (h.uslugi || []).map((r) => Object.assign({}, r)),
                towars: (h.towary || []).map((r) => Object.assign({}, r)),
              });
              return { quotes: Object.assign({}, st.quotes, { [id]: Object.assign({}, q, { state: next }) }) };
            });
            this.ziloToast('Oferta z ' + h.date + ' przywrócona do wyceny');
          },
          menuOpen: s.historyMenu === id + ':' + i,
          toggleMenu: (e) => {
            e.stopPropagation();
            this.setState((st) => ({ historyMenu: st.historyMenu === id + ':' + i ? null : id + ':' + i }));
          },
          options: ['Wysłana', 'Zaakceptowana', 'Odrzucona'].map((label) => ({
            label: label,
            bg: tone(label).bg,
            color: tone(label).color,
            pick: (e) => {
              e.stopPropagation();
              this.setState((st) => {
                const list = (st.offerHistory[id] || []).map((x, k) => (k === i ? Object.assign({}, x, { status: label }) : x));
                return { offerHistory: Object.assign({}, st.offerHistory, { [id]: list }), historyMenu: null };
              });
            },
          })),
          u: h.u,
          t: h.t,
          amt: h.amt,
          border: i === hist.length - 1 ? 'transparent' : 'var(--tk-border-2)',
        };
      }),
    };
  }

  // Grupa oznaczona w ustawieniach jako domyślna obowiązuje każdego klienta,
  // dopóki ktoś nie wybierze mu innej w edytorze.
  defaultGroupName() {
    const list = this.state.priceGroups || DEFAULT_PRICE_GROUPS;
    const def = list.filter((g) => g.isDefault)[0] || list[0];
    return def ? def.name : '';
  }

  clientGroup(clientId) {
    return ((this.state.clientGroups || {})[clientId]) || this.defaultGroupName();
  }

  // Nazwa z narzutem — „Cennik producenta" liczy od sugerowanej ceny, więc nie ma procentu.
  clientGroupLabel(clientId) {
    const name = this.clientGroup(clientId);
    const g = (this.state.priceGroups || DEFAULT_PRICE_GROUPS).filter((x) => x.name === name)[0];
    if (!g || (g.mode === 'msrp' && !g.pct)) return name;
    return name + ' +' + (g.pct || 0) + '%';
  }

  // Po dopisaniu wiersza do historii przewija szczegóły wizyty tak, żeby było go widać,
  // i po chwili gasi podświetlenie. Druga próba ratuje przypadek, gdy przy pierwszej
  // wiersz nie zdążył się wyrenderować.
  flashScroll(key) {
    const go = () => {
      const el = this.evScrollRef.current;
      if (!el) return;
      const row = el.querySelector('[data-flash="1"]');
      if (row && row.scrollIntoView) row.scrollIntoView({ block: 'center', behavior: 'smooth' });
      else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };
    setTimeout(go, 60);
    setTimeout(go, 320);
    setTimeout(() => this.setState({ [key]: null }), 2600);
  }

  // sprzedawcą na fakturze jest firma warsztatu z „Danych rozliczeniowych"
  garageSeller() {
    const g = this.state.garage || GARAGE_SEED;
    return {
      company: g.company || g.name || '',
      nip: g.nip || '',
      street: g.companyStreet || '',
      zip: g.companyZip || '',
      city: g.companyCity || '',
    };
  }

  openInvoiceConfig(visitId, opts) {
    // faktura wychodzi przez narzędzie fakturowe — bez połączenia prowadzimy
    // najpierw przez konfigurację, a potem wracamy tu, gdzie użytkownik był
    const connected = this.state.connectedBilling || DEFAULT_BILLING;
    if (!connected.length && !(opts && opts.force)) {
      this.setState({
        screen: 'billingPick',
        billingDraft: { name: '', fields: {}, editing: null },
        fvAfterBilling: { visitId: visitId, opts: opts || null, screen: this.state.screen },
      });
      return;
    }
    // ten sam wzorzec co oferta: znacznik czasu lamie cache iframe'a
    const seq = Date.now() + '-' + (this.__fvSeq = (this.__fvSeq || 0) + 1);
    let src = 'konfigurator-faktur/v1.html?n=' + seq;
    try {
      const ev = EVENTS.filter((x) => x.id === visitId)[0] || {};
      const client = CLIENTS.filter((c) => c.cars.some((car) => car.plate === ev.plate))[0] || null;
      const invoices = this.state.clientInvoice || {};
      const st = ((this.state.quotes || {})[visitId] || {}).state || {};
      const trim = (list, withProducent) => (list || []).map((r) => {
        const row = { name: r.name || '', unit: r.unit || 'Sztuka', qty: r.qty || '1', cena: r.cena || '0,00', vat: r.vat || '23' };
        if (withProducent) row.producent = r.producent || '';
        return row;
      });
      let uslugi = [], towary = [];
      // faktura z konkretnej wysłanej oferty bierze jej pozycje, nie bieżącą wycenę
      const fromOffer = opts && (opts.uslugi || opts.towary);
      if (fromOffer) {
        uslugi = trim(opts.uslugi, false);
        towary = trim(opts.towary, true);
      } else if (Array.isArray(st.groups)) {
        st.groups.forEach((g) => {
          if (g.robocizna) uslugi = uslugi.concat(trim([g.robocizna], false));
          towary = towary.concat(trim(g.towars, true));
        });
      } else {
        uslugi = trim(st.robociznas, false);
        towary = trim(st.towars, true);
      }
      // nabywcą jest firma przypisana do TEGO klienta, nie dowolny wpis z bazy
      const mine = client ? (invoices[client.id] || null) : null;
      const hasInv = !!(mine && mine.on && String(mine.company || '').trim());
      const companies = hasInv
        ? [{ key: client.id, label: mine.company, invoice: { nip: mine.nip || '', company: mine.company || '', street: mine.street || '', zip: mine.zip || '', city: mine.city || '' } }]
        : [];
      // stub GUS — w prototypie każdy poprawny NIP zwraca te same dane, tak jak w edytorze klienta
      const gus = hasInv
        ? { company: mine.company, street: mine.street, zip: mine.zip, city: mine.city }
        : {
            company: (String((client && client.name) || 'Auto').split(' ').pop() || 'Auto') + ' Sp. z o.o.',
            street: 'ul. Ignacego Dobrogojskiego 30A', zip: '61-692', city: 'Poznań',
          };
      // uwagi drukują się na fakturze — pojazd wizyty wchodzi tam z automatu
      const auto = [ev.brand, ev.model].filter(Boolean).join(' ').trim();
      const uwagi = [auto && 'Pojazd: ' + auto, ev.plate && 'nr rej. ' + ev.plate]
        .filter(Boolean).join(', ');
      const nextNo = ((this.state.fvHistory || {})[visitId] || []).length + 1;
      const now = new Date();
      const payload = {
        today: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0'),
        numer: nextNo + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear(),
        client: { name: (client && client.name) || ev.client || '', phone: (client && client.phone) || ev.phone || '', email: (client && client.email) || '' },
        invoice: hasInv ? { nip: mine.nip, company: mine.company, street: mine.street, zip: mine.zip, city: mine.city } : {},
        buyerKey: hasInv ? client.id : '__nowy',
        companies: companies,
        gus: gus,
        seller: this.garageSeller(),
        uslugi: uslugi,
        towary: towary,
        uwagi: uwagi,
      };
      src += '#fv=' + encodeURIComponent(JSON.stringify(payload));
      src += '&docs=' + encodeURIComponent(JSON.stringify(this.docsPayload()));
      if (opts && opts.pick) src += '&pick=' + encodeURIComponent(opts.pick);
    } catch (e) {}
    try { src += (src.indexOf('#') >= 0 ? '&' : '#') + 'theme=' + (document.documentElement.getAttribute('data-theme') || 'light'); } catch (e) {}
    this.setState({ fvConfigSrc: src, fvConfigVisit: visitId });
  }

  onFvMessage(d) {
    if (!this.state.fvConfigSrc) return;
    if (d.__fv === 'close') { this.setState({ fvConfigSrc: null, fvConfigVisit: null }); return; }
    if (d.__fv === 'editSeller') {
      // konfigurator zostaje zamontowany, tylko chowamy go na czas edycji —
      // inaczej iframe przeładowałby się i zgubił wpisane pozycje
      this.setState({
        billingEdit: 'company',
        fvSellerEdit: true,
        garageDraft: JSON.parse(JSON.stringify(this.state.garage || GARAGE_SEED)),
      });
      return;
    }
    if (d.__fv === 'toast') { this.ziloToast(String(d.text || '')); return; }
    if (d.__fv === 'addDoc') { this.goUploadDoc('invoice', d.state); return; }
    if (d.__fv !== 'issue') return;
    const id = this.state.fvConfigVisit;
    const st = d.state || {};
    const t = d.totals || {};
    this.setState((prev) => {
      const now = new Date();
      const M = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
      const entry = {
        numer: st.numer || '',
        buyer: (st.buyer && st.buyer.company) || '',
        date: now.getDate() + ' ' + M[now.getMonth()] + ' ' + now.getFullYear(),
        status: st.status || 'Wystawiona',
        ksef: d.mode === 'ksef' ? 'W trakcie' : 'Do wysyłki',
        amt: t.gross || '0,00 zł',
      };
      return {
        fvHistory: Object.assign({}, prev.fvHistory, { [id]: (prev.fvHistory[id] || []).concat([entry]) }),
        fvConfigSrc: null,
        fvConfigVisit: null,
        evTab: 'wycena',
        fvHistoryOpen: true,
        fvFlash: id + ':' + (prev.fvHistory[id] || []).length,
      };
    });
    this.ziloToast('Faktura ' + (st.numer || '')
      + (d.mode === 'ksef' ? ' zapisana, trwa wysyłka do KSeF' : ' zapisana'));
    this.flashScroll('fvFlash');
    // KSeF odpowiada z opóźnieniem — w prototypie odtwarzamy to zegarem,
    // status prowadzi system, użytkownik go nie przestawia
    if (d.mode === 'ksef') this.settleKsef(id, st.numer || '');
  }

  // dociągnięcie statusu z KSeF — jedyne miejsce, które go zmienia
  settleKsef(visitId, numer) {
    const at = ((this.state.fvHistory || {})[visitId] || []).length - 1;
    if (at < 0) return;
    if (this.__ksefTimer) clearTimeout(this.__ksefTimer);
    this.__ksefTimer = setTimeout(() => {
      this.setState((prev) => ({
        fvHistory: Object.assign({}, prev.fvHistory, {
          [visitId]: (prev.fvHistory[visitId] || []).map((x, i) => (
            i === at ? Object.assign({}, x, { ksef: 'Wysłano' }) : x)),
        }),
      }));
      this.ziloToast('Faktura ' + numer + ' przyjęta przez KSeF');
    }, 3000);
  }

  // podgląd dokumentu w programie do fakturowania
  openBilling(numer) {
    try { window.open('https://fakturownia.pl', '_blank', 'noopener'); } catch (e) {}
    this.ziloToast('Faktura ' + numer + ' otwarta w programie do fakturowania');
  }

  // ten sam zestaw dokumentów trafia do wszystkich trzech konfiguratorów
  // „Wgraj dokument" z konfiguratora: chowamy go, wgrywamy w Towarach i wracamy
  goUploadDoc(from, st) {
    const visit = from === 'offer' ? this.state.offerConfigVisit : this.state.fvConfigVisit;
    this.setState((prev) => ({
      docReturn: { visit: visit, from: from, state: st || null, screen: prev.screen, eventId: prev.eventId, navKey: prev.navKey },
      offerConfigSrc: from === 'offer' ? null : prev.offerConfigSrc,
      offerConfigVisit: from === 'offer' ? null : prev.offerConfigVisit,
      fvConfigSrc: from === 'invoice' ? null : prev.fvConfigSrc,
      fvConfigVisit: from === 'invoice' ? null : prev.fvConfigVisit,
      navKey: 'goods',
      screen: 'docUpload',
      docUploadPct: 0,
      docRows: null,
      docDraft: null,
    }));
  }

  docsPayload() {
    return this.docList().slice(0, 12).map((d) => ({
      nr: d.nr,
      supplier: d.supplier,
      date: d.date,
      // docRowsById nigdy nie było zapisywane, więc każdy dokument dostawał
      // ten sam zestaw z DOC_POSITIONS. Pozycje trzymane są w d.rows.
      items: (d.rows || []).map((r) => ({
        name: r.name, indeks: r.code, producent: r.producer || '', cena: r.price, vat: r.vat || '23', msrp: r.msrp || '',
      })),
    }));
  }

  openOfferConfig(visitId, opts) {
    // licznik startuje od 1 przy każdym przeładowaniu strony, więc sam w sobie
    // nie łamie cache przeglądarki — stąd znacznik czasu
    const seq = Date.now() + '-' + (this.__ofrSeq = (this.__ofrSeq || 0) + 1);
    let src = 'konfigurator-ofert/v1.html?n=' + seq;
    try {
      const ev = EVENTS.filter((x) => x.id === visitId)[0] || {};
      const client = CLIENTS.filter((c) => c.cars.some((car) => car.plate === ev.plate))[0] || null;
      const st = ((this.state.quotes || {})[visitId] || {}).state || {};
      const trim = (list, withProducent) => (list || []).map((r) => {
        const row = { name: r.name || '', unit: r.unit || 'Sztuka', qty: r.qty || '1', cena: r.cena || '0,00', vat: r.vat || '23' };
        if (withProducent) row.producent = r.producent || '';
        return row;
      });
      let uslugi = [], towary = [];
      if (Array.isArray(st.groups)) {
        st.groups.forEach((g) => {
          if (g.robocizna) uslugi = uslugi.concat(trim([g.robocizna], false));
          towary = towary.concat(trim(g.towars, true));
        });
      } else {
        uslugi = trim(st.robociznas, false);
        towary = trim(st.towars, true);
      }
      const payload = {
        client: { name: (client && client.name) || ev.client || '', phone: (client && client.phone) || ev.phone || '', email: (client && client.email) || '' },
        uslugi: uslugi,
        towary: towary,
        notatka: st.notatka || '',
        komentarz: st.komentarz || '',
      };
      src += '#offer=' + encodeURIComponent(JSON.stringify(payload));
      src += '&docs=' + encodeURIComponent(JSON.stringify(this.docsPayload()));
      if (opts && opts.pick) src += '&pick=' + encodeURIComponent(opts.pick);
    } catch (e) {}
    try { src += (src.indexOf('#') >= 0 ? '&' : '#') + 'theme=' + (document.documentElement.getAttribute('data-theme') || 'light'); } catch (e) {}
    this.setState({ offerConfigSrc: src, offerConfigVisit: visitId });
  }

  onOfferMessage(d) {
    if (!this.state.offerConfigSrc) return;
    if (d.__ofr === 'close') { this.setState({ offerConfigSrc: null, offerConfigVisit: null }); return; }
    if (d.__ofr === 'toast') { this.ziloToast(String(d.text || '')); return; }
    if (d.__ofr === 'addDoc') { this.goUploadDoc('offer', d.state); return; }
    if (d.__ofr !== 'send') return;
    const id = this.state.offerConfigVisit;
    const t = d.totals || {};
    this.setState((prev) => {
      const now = new Date();
      const M = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
      const st = d.state || {};
      const keep = (list, withProducent) => (list || []).map((r) => {
        const row = { name: r.name || '', unit: r.unit || 'Sztuka', qty: r.qty || '1', cena: r.cena || '0,00', vat: r.vat || '23' };
        if (withProducent) row.producent = r.producent || '';
        return row;
      });
      const entry = {
        date: now.getDate() + ' ' + M[now.getMonth()] + ', ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
        status: 'Wysłana',
        u: t.uslugi || '0,00 zł',
        t: t.towary || '0,00 zł',
        amt: t.gross || '0,00 zł',
        uslugi: keep(st.uslugi, false),
        towary: keep(st.towary, true),
      };
      return {
        offerHistory: Object.assign({}, prev.offerHistory, { [id]: (prev.offerHistory[id] || []).concat([entry]) }),
        offerConfigSrc: null,
        offerConfigVisit: null,
        evTab: 'wycena',
        historyOpen: true,
        offerFlash: id + ':' + (prev.offerHistory[id] || []).length,
      };
    });
    this.ziloToast('Oferta wysłana do klienta');
    this.flashScroll('offerFlash');
  }

  openWycConfig(visitId, focus, opts) {
    // licznik startuje od 1 przy każdym przeładowaniu strony, więc sam w sobie
    // nie łamie cache przeglądarki — stąd znacznik czasu
    const seq = Date.now() + '-' + (this.__wycSeq = (this.__wycSeq || 0) + 1);
    let src = 'konfigurator-wycen-2/v2.html?n=' + seq;
    const saved = (this.state.quotes || {})[visitId];
    try {
      // Towary przypisane z zakładki „Towary" żyją poza stanem wyceny — bez tego
      // konfigurator otwierał się pusty, mimo że w szczegółach wizyty były widoczne.
      const parts = (this.state.visitParts || {})[visitId] || [];
      let st = saved && saved.state ? JSON.parse(JSON.stringify(saved.state)) : null;
      if (parts.length) {
        if (!st) {
          st = {
            robociznas: [{ id: 1, osoba: null, name: '', qty: '1', czas: '0', cena: '0,00', rabat: '', unit: 'Sztuka', vat: '23', bruttoEditing: null, openField: null }],
            towars: [],
          };
        }
        if (!Array.isArray(st.towars)) st.towars = [];
        if (!Array.isArray(st.robociznas)) st.robociznas = [];
        parts.forEach((p, i) => st.towars.push({
          id: 900 + i,
          name: p.name || '',
          indeks: p.indeks || '',
          producent: p.producent || '',
          qty: p.qty || '1',
          cena: p.cena || '0,00',
          koszt: p.koszt || '0,00',
          kosztBrutto: p.kosztBrutto || '0,00',
          rabat: '',
          unit: p.unit || 'Sztuka',
          vat: p.vat || '23',
          grupa: p.grupa || '',
          doc: p.doc || '',
          bruttoEditing: null,
          openField: null,
        }));
      }
      if (st) src += '#state=' + encodeURIComponent(JSON.stringify(st));
      if (opts && opts.preview) src += (src.indexOf('#') >= 0 ? '&' : '#') + 'preview=1';
      if (opts && opts.pick) src += (src.indexOf('#') >= 0 ? '&' : '#') + 'pick=' + encodeURIComponent(opts.pick === true ? '1' : opts.pick);
      const ev = EVENTS.filter((x) => x.id === visitId)[0] || {};
      const cliRec = CLIENTS.filter((c) => c.cars.some((x) => x.plate === ev.plate))[0] || null;
      const car = { name: ev.client || '', phone: ev.phone || '', service: ev.reason || '', opis: (NOTES || {})[visitId] || '', grupa: cliRec ? this.clientGroupLabel(cliRec.id) : this.clientGroupLabel(null) };
      src += (src.indexOf('#') >= 0 ? '&' : '#') + 'car=' + encodeURIComponent(JSON.stringify(car));
      const groups = (this.state.priceGroups || DEFAULT_PRICE_GROUPS).map((g) => ({ name: g.name, pct: g.pct, mode: g.mode }));
      src += '&groups=' + encodeURIComponent(JSON.stringify(groups));
      src += '&docs=' + encodeURIComponent(JSON.stringify(this.docsPayload()));
    } catch (e) {}
    this.__wycFocus = focus || null;
    this.__wycSend = !!(opts && opts.send);
    try { src += (src.indexOf('#') >= 0 ? '&' : '#') + 'theme=' + (document.documentElement.getAttribute('data-theme') || 'light'); } catch (e) {}
    this.setState({ wycConfigSrc: src, wycConfigVisit: visitId });
  }

  // Raport „Przechowalnia opon" — jeden wiersz na komplet, ze wszystkich aut wszystkich klientów
  reportRows() {
    const s = this.state;
    const out = [];
    CLIENTS.forEach((cl) => {
      (cl.cars || []).forEach((car, carIdx) => {
        this.tireSetsFor(car.id).forEach((t) => {
          const key = car.id + '::' + t.__idx;
          const stored = (s.setStatus[key] || t.status || 'in') === 'in';
          out.push({
            key: key,
            clientId: cl.id,
            clientName: cl.name,
            carIdx: String(carIdx),
            carName: (car.brand + ' ' + car.model).trim(),
            plate: car.plate || '—',
            season: t.season || '—',
            code: t.code || '—',
            location: t.location || '—',
            received: t.received || '—',
            stored: stored,
          });
        });
      });
    });
    return out;
  }

  reportsVals() {
    const s = this.state;
    const q = (s.reportsQuery || '').trim().toLowerCase();
    const all = this.reportRows();
    const hit = (r) => [r.clientName, r.carName, r.plate, r.code, r.location, r.season]
      .join(' ').toLowerCase().indexOf(q) !== -1;
    const rows = q ? all.filter(hit) : all;
    const inStore = all.filter((r) => r.stored);
    const bySeason = (name) => inStore.filter((r) => r.season === name).length;

    const navOpen = s.reportsNavOpen !== false;

    return Object.assign({
      // lewa nawigacja 1:1 z NotificationsNavigation.vue (Marketing w zilo-front-v2)
      navOpen: navOpen,
      navWidth: navOpen ? '240px' : 'auto',
      navHeadPad: navOpen ? '8px 0 8px 20px' : '0',
      navTip: navOpen ? 'Zwiń' : 'Rozwiń',
      toggleNav: () => this.setState((st) => ({ reportsNavOpen: st.reportsNavOpen === false })),
      navItems: [
        { key: 'payroll', label: 'Rozliczenia pracowników', ready: false },
        { key: 'tires', label: 'Przechowalnia opon', ready: true },
      ].filter((it) => it.key !== 'tires' || s.tireStorageOn).map((it) => {
        const active = it.ready && (s.reportsTab || 'tires') === it.key;
        return {
          key: it.key,
          label: it.label,
          bg: active ? 'var(--tk-brand-soft)' : 'transparent',
          color: it.ready ? 'var(--tk-text)' : 'var(--tk-text-2)',
          cursor: it.ready ? 'pointer' : 'not-allowed',
          tip: it.ready ? '' : 'Wkrótce',
        };
      }),
      pickNav: (e) => {
        const key = e.currentTarget.dataset.report;
        if (key !== 'tires') return;
        this.setState({ reportsTab: key });
      },
      total: String(all.length),
      inCount: String(inStore.length),
      winterCount: String(bySeason('Zima')),
      summerCount: String(bySeason('Lato')),
      empty: rows.length === 0,
      hasRows: rows.length > 0,
      query: s.reportsQuery || '',
      setQuery: (e) => this.setState({ reportsQuery: e.target.value }),
      search: {
        filled: (s.reportsQuery || '').length > 0,
        gap: (s.reportsQuery || '') ? '2px' : '0px',
        pad: (s.reportsQuery || '') ? '9px 13px' : '20px 13px',
        placeholder: (s.reportsQuery || '') ? '' : 'Szukaj po kliencie, aucie lub ID',
      },
      downloadCsv: () => this.downloadReportCsv(),
      rows: rows.map((r, i) => Object.assign({}, r, {
        rowBorder: i === rows.length - 1 ? 'transparent' : 'var(--tk-border-2)',
        status: r.stored ? 'W przechowalni' : 'Wydane',
        statusBg: r.stored ? 'var(--tk-ok-soft)' : 'var(--tk-surface-2)',
        statusColor: r.stored ? 'var(--tk-ok-fg)' : 'var(--tk-text-2)',
        statusDot: r.stored ? 'var(--tk-ok)' : 'var(--tk-text-3)',
      }, seasonVals(r.season))),
    }, seasonVals('Zima', 'winter'), seasonVals('Lato', 'summer'));
  }

  downloadReportCsv() {
    const head = ['Przyjeto', 'Klient', 'Pojazd', 'Rejestracja', 'Sezon', 'ID kompletu', 'Lokalizacja', 'Status'];
    const cell = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = [head.join(';')].concat(this.reportRows().map((r) => [
      r.received, r.clientName, r.carName, r.plate, r.season, r.code, r.location,
      r.stored ? 'W przechowalni' : 'Wydane',
    ].map(cell).join(';')));
    // BOM, żeby Excel nie połamał polskich znaków
    const csv = '\ufeff' + lines.join('\r\n');
    try {
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'opony-w-przechowalni.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.ziloToast('Pobrano raport — ' + (lines.length - 1) + ' kompletów');
    } catch (err) {
      this.ziloToast('Nie udało się pobrać pliku');
    }
  }

  ziloToast(text) {
    this.setState({ assignToast: text, assignToastRun: false, assignedVisitId: null });
    if (this.__assignToastTimer) clearTimeout(this.__assignToastTimer);
    setTimeout(() => { if (this.state.assignToast) this.setState({ assignToastRun: true }); }, 60);
    this.__assignToastTimer = setTimeout(() => this.setState({ assignToast: '', assignToastRun: false }), 10000);
  }

  explodeRows(rows) {
    const out = [];
    (rows || []).forEach((r) => {
      const q = parseInt(r.qty, 10) || 1;
      for (let k = 0; k < q; k += 1) out.push(Object.assign({}, r, { qty: '1', grossEdit: null }));
    });
    return out;
  }

  docList() {
    return this.state.docsList || DOC_SEED;
  }

  docNum(x) {
    return parseFloat(String(x).replace(/\s/g, '').replace(',', '.')) || 0;
  }

  docTotals(rows) {
    const net = (rows || []).reduce((a, r) => a + this.docNum(r.qty) * this.docNum(r.price), 0);
    const vat = (rows || []).reduce((a, r) => a + this.docNum(r.qty) * this.docNum(r.price) * ((parseFloat(r.vat) || 0) / 100), 0);
    const pieces = (rows || []).reduce((a, r) => a + (parseInt(r.qty, 10) || 1), 0);
    return { net: net, vat: vat, gross: net + vat, pieces: pieces };
  }

  moneyPl(n) {
    return n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/, ' ') + ' zł';
  }

  patchDocDraft(patch) {
    const cur = this.state.docDraft || DOC_DRAFT;
    this.setState({ docDraft: Object.assign({}, cur, patch) });
  }

  patchDocRow(i, patch) {
    const rows = this.state.docRows || DOC_DRAFT_ROWS;
    this.setState({ docRows: rows.map((r, k) => (k === i ? Object.assign({}, r, patch) : r)) });
  }

  runDocUpload() {
    if (this.__uploadTimer) clearInterval(this.__uploadTimer);
    let pct = 8;
    this.setState({ docUploadPct: pct });
    this.__uploadTimer = setInterval(() => {
      if (this.state.screen !== 'docUpload') {
        clearInterval(this.__uploadTimer);
        this.__uploadTimer = null;
        return;
      }
      pct = Math.min(100, pct + 12);
      this.setState({ docUploadPct: pct });
      if (pct < 100) return;
      clearInterval(this.__uploadTimer);
      this.__uploadTimer = null;
      setTimeout(() => {
        if (this.state.screen !== 'docUpload') return;
        this.setState({ screen: 'docReview', docUploadPct: 0, docSnack: true, docSnackRun: false });
        setTimeout(() => {
          if (this.state.docSnack) this.setState({ docSnackRun: true });
        }, 60);
        setTimeout(() => {
          if (this.state.screen === 'docReview') this.setState({ docSnack: false });
        }, 10000);
      }, 400);
    }, 180);
  }

  runDocUploadLegacy() {
    const tick = () => {
      const pct = this.state.docUploadPct;
      if (this.state.screen !== 'docUpload' || !pct) return;
      if (pct >= 100) {
        setTimeout(() => {
          if (this.state.screen !== 'docUpload') return;
          this.setState({ screen: 'docReview', docUploadPct: 0, docSnack: true, docSnackRun: false });
          setTimeout(() => {
            if (this.state.docSnack) this.setState({ docSnackRun: true });
          }, 60);
          setTimeout(() => {
            if (this.state.screen === 'docReview') this.setState({ docSnack: false });
          }, 10000);
        }, 400);
        return;
      }
      this.setState({ docUploadPct: Math.min(100, pct + 12) });
      setTimeout(tick, 180);
    };
    setTimeout(tick, 220);
  }

  dsFieldState(value) {
    const filled = String(value == null ? '' : value).length > 0;
    return {
      filled: filled,
      empty: !filled,
      pad: filled ? '9px 13px' : '20px 13px',
      labelSize: filled ? '12px' : '16px',
      labelLine: filled ? '16px' : '20px',
    };
  }

  scrollAssignToToday() {
    if (this.assignTimer) clearInterval(this.assignTimer);
    let tries = 0;
    const apply = () => {
      tries += 1;
      const el = this.assignRef.current;
      const today = el ? el.querySelector('[data-day="today"]') : null;
      if (el && today && el.clientHeight > 0 && el.scrollHeight > el.clientHeight) {
        const base = today.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
        const lead = Math.min(140, Math.round(el.clientHeight * 0.22));
        const target = Math.max(0, Math.min(base - lead, el.scrollHeight - el.clientHeight));
        if (Math.abs(el.scrollTop - target) > 2) el.scrollTop = target;
        if (tries > 8) { clearInterval(this.assignTimer); this.assignTimer = null; }
        return;
      }
      if (tries > 60) { clearInterval(this.assignTimer); this.assignTimer = null; }
    };
    apply();
    this.assignTimer = setInterval(apply, 50);
  }


  patchGroupDraft(patch) {
    const cur = this.state.groupDraft || { name: '', pct: '35', mode: 'pct', isDefault: false, editing: null };
    this.setState({ groupDraft: Object.assign({}, cur, patch) });
  }

  patchSupplierDraft(patch) {
    const cur = this.state.supplierDraft || { name: '', login: '', pass: '', client: '', editing: null };
    this.setState({ supplierDraft: Object.assign({}, cur, patch) });
  }

  currentCarId() {
    if (this.state.screen === 'client') {
      const c = CLIENTS.find((x) => x.id === this.state.clientId) || CLIENTS[0];
      const car = c.cars[Math.min(this.state.carIdx, c.cars.length - 1)];
      return car ? car.id : null;
    }
    return this.visitCarId();
  }

  tireSetsFor(carId) {
    const base = (TIRE_SETS[carId]
      || (TIRES[carId] ? [{ ...TIRES[carId], status: 'in', note: '', files: ['photo'] }] : []))
      .concat(this.state.addedSets[carId] || [])
      .map((t, i) => {
        const patch = this.state.editedSets[carId + '::' + i];
        return patch ? { ...t, ...patch } : t;
      });
    const removed = this.state.removedSets[carId] || [];
    return base.map((t, i) => ({ ...t, __idx: i })).filter((t) => removed.indexOf(t.__idx) === -1);
  }

  // Maska NIP: 3-3-2-2. Wpisana cyfra „zjada" jedną kreskę, reszta zostaje widoczna.
  static NIP_MASK = '___ ___ __ __';
  static NIP_POS = [0, 1, 2, 4, 5, 6, 8, 9, 11, 12];

  nipDigits(v) {
    return String(v == null ? '' : v).replace(/[^0-9]/g, '').slice(0, 10);
  }

  nipFormat(v) {
    const d = this.nipDigits(v);
    let out = '';
    for (let i = 0; i < d.length; i += 1) {
      if (i === 3 || i === 6 || i === 8) out += ' ';
      out += d[i];
    }
    return out;
  }

  nipRest(v) {
    const d = this.nipDigits(v);
    if (!d.length) return Component.NIP_MASK;
    return Component.NIP_MASK.slice(Component.NIP_POS[d.length - 1] + 1);
  }

  // Jedna definicja sekcji „Dane do faktury" — używana i w modalu klienta,
  // i w edytorze klienta przy wizycie. formKey wskazuje, który formularz obsługujemy.
  invVals(formKey, selKey) {
    const f = (this.state[formKey] && this.state[formKey].invoice) || {};
    const pl = (f.country || 'Polska') === 'Polska';
    const nipOk = this.nipComplete(f.nip);
    // czerwony stan dopiero po wyjściu z pola — w trakcie wpisywania NIP z definicji jest niepełny
    const nipTouched = !!f.nipBlurred;
    const patch = (p) => this.setState((st) => ({
      [formKey]: Object.assign({}, st[formKey], {
        invoice: Object.assign({}, (st[formKey] || {}).invoice, p),
      }),
    }));
    return {
      on: !!f.on,
      showAdd: !f.on,
      // tytuł karty pojawia się dopiero, gdy jest co pokazać
      title: f.company ? (f.company + '  ·  NIP: ' + this.nipFormat(f.nip)) : '',
      hasTitle: !!f.company,
      expanded: !!f.on && !!f.expanded,
      arrow: (f.on && f.expanded) ? 'rotate(180deg)' : 'rotate(0deg)',
      nip: this.nipFormat(f.nip),
      nipTyped: this.nipFormat(f.nip),
      nipRest: this.nipRest(f.nip),
      nipLabel: this.nipDigits(f.nip).length ? 'NIP' : 'NIP*',
      nipBorder: nipTouched && !nipOk ? 'var(--tk-danger)' : 'var(--tk-border-strong)',
      hasError: nipTouched && !nipOk,
      error: 'NIP musi mieć 10 cyfr.',
      // pola firmowe stoją zawsze — można je wypełnić ręcznie albo zaciągnąć z GUS
      showCompany: true,
      company: f.company || '',
      street: f.street || '',
      zip: f.zip || '',
      city: f.city || '',

      add: (e) => { if (e && e.stopPropagation) e.stopPropagation(); patch({ on: true, expanded: true }); },
      remove: (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        patch({ on: false, expanded: false, nip: '', nipBlurred: false, fetched: false, company: '', street: '', zip: '', city: '' });
      },
      toggleBody: () => { if (f.on) patch({ expanded: !f.expanded }); },
      onField: (e) => {
        const key = e.currentTarget.dataset.invField;
        const val = e.target.value;
        const p = { [key]: val };
        if (key === 'nip') {
          p.nip = this.nipFormat(val);
          p.nipBlurred = false;
        }
        patch(p);
      },
      onNipBlur: () => patch({ nipBlurred: true }),
      // dane firmowe zaciąga dopiero przycisk — sam wpisany numer niczego nie robi
      gusDisabled: !nipOk,
      gusOpacity: nipOk ? '1' : '0.45',
      gusCursor: nipOk ? 'pointer' : 'not-allowed',
      fetchGus: (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!nipOk) return;
        const c = CLIENTS.find((x) => x.id === this.state.clientId) || CLIENTS[0];
        patch({
          fetched: true,
          company: (c.name.split(' ').pop() || 'Auto') + ' Sp. z o.o.',
          zip: '61-692',
          street: 'ul. Ignacego Dobrogojskiego 30A',
          city: 'Poznań',
        });
        this.ziloToast('Dane firmy pobrane z GUS');
      },
    };
  }

  // Kompletny numer = 10 cyfr. W prototypie to wystarcza, żeby zaciągnąć dane.
  nipComplete(nip) {
    return this.nipDigits(nip).length === 10;
  }

  // Suma kontrolna wg wzoru KSeF — zostaje w kodzie, ale nie blokuje prototypu.
  nipValid(nip) {
    const d = String(nip || '').replace(/[^0-9]/g, '');
    if (d.length !== 10) return false;
    const w = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i += 1) sum += w[i] * Number(d[i]);
    const c = sum % 11;
    return c !== 10 && c === Number(d[9]);
  }

  storageVals(carId) {
    const sets = this.tireSetsFor(carId);
    const open = this.state.openTireSet;
    const menu = this.state.openTireMenu;
    return {
      hasSets: sets.length > 0,
      empty: sets.length === 0,
      sets: sets.map((t, i) => {
        const key = carId + '::' + t.__idx;
        const cardBorder = i === sets.length - 1 ? 'transparent' : 'var(--tk-border-2)';
        // domyślnie wszystkie komplety zwinięte — rozwija dopiero kliknięcie
        const isOpen = open === key;
        const status = this.state.setStatus[key] || t.status;
        const isIn = status === 'in';
        const stMeta = { in: { label: 'W przechowalni', dot: 'var(--tk-ok)', bg: 'var(--tk-ok-soft)', color: 'var(--tk-ok-fg)' }, out: { label: 'Wydane', dot: 'var(--tk-text-3)', bg: 'var(--tk-surface-3)', color: 'var(--tk-text-2)' } };
        return {
          key,
          cardBorder,
          rowBg: isOpen ? 'transparent' : 'var(--tk-surface)',
          groupBg: isOpen ? 'var(--tk-surface-2)' : 'transparent',
          rowMarker: isOpen ? 'var(--tk-brand)' : 'transparent',
          season: t.season,
          code: t.code,
          ...seasonVals(t.season),
          statusLabel: stMeta[status].label,
          statusDot: stMeta[status].dot,
          statusBg: stMeta[status].bg,
          statusColor: stMeta[status].color,
          statusMenuOpen: this.state.statusMenu === key,
          statusChevron: this.state.statusMenu === key ? 'rotate(180deg)' : 'rotate(0deg)',
          statusOptions: ['in', 'out'].map((k) => ({
            key: k,
            label: stMeta[k].label,
            dot: stMeta[k].dot,
            bg: stMeta[k].bg,
            color: stMeta[k].color,
            current: k === status,
            rowBg: k === status ? 'var(--tk-surface-2)' : 'transparent',
          })),
          received: t.received,
          released: t.released || '—',
          releasedColor: t.released ? 'var(--tk-text)' : 'var(--tk-text-3)',
          expanded: isOpen,
          arrowRotate: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          menuOpen: menu === key,
          location: t.location || '',
          hasLocation: !!t.location,
          note: t.note || '',
          hasNote: !!t.note,
          hasFiles: (t.files || []).length > 0,
          hasMeta: !!t.location || !!t.note || (t.files || []).length > 0,
          files: (t.files || []).map((f, fi) => ({
            key: key + '-' + fi,
            isDoc: f === 'doc',
            isPhoto: f !== 'doc',
          })),
          hasTread: this.specRows(t.wheels).some((r) => !!r.tread),
          wheels: (() => {
            const rows = this.specRows(t.wheels);
            const anyTread = rows.some((r) => !!r.tread);
            return rows.map((r, wi) => ({
              maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
              tread: r.tread || '—',
              showTread: anyTread,
              cols: anyTread ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
              rowBorder: wi === rows.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            }));
          })(),
          treadCols: this.specRows(t.wheels).some((r) => !!r.tread) ? '1fr 1fr 0.7fr 0.9fr 0.6fr' : '1fr 1fr 0.7fr 0.6fr',
        };
      }),
    };
  }

  clientDetail() {
    const c = CLIENTS.find((x) => x.id === this.state.clientId) || CLIENTS[0];
    const idx = Math.min(this.state.carIdx, c.cars.length - 1);
    const car = c.cars[idx];
    const chip = (on, label) => ({
      label,
      icon: on ? '✓' : '✕',
      bg: on ? 'var(--tk-ok-soft)' : 'var(--tk-surface-3)',
      color: on ? 'var(--tk-ok)' : 'var(--tk-text-2)',
    });
    return {
      name: c.name,
      phone: c.phone,
      email: c.email || '-',
      priceGroup: this.clientGroup(c.id),
      hasInvoice: !!((this.state.clientInvoice || {})[c.id] || {}).on,
      invNip: this.nipFormat((((this.state.clientInvoice || {})[c.id]) || {}).nip) || '—',
      invCompany: (((this.state.clientInvoice || {})[c.id]) || {}).company || '—',
      invStreet: (((this.state.clientInvoice || {})[c.id]) || {}).street || '—',
      invZip: (((this.state.clientInvoice || {})[c.id]) || {}).zip || '—',
      invCity: (((this.state.clientInvoice || {})[c.id]) || {}).city || '—',
      carCount: c.cars.length,
      consents: [chip(c.sms, 'Zgoda na SMS'), chip(c.mail, 'Zgoda na e-mail'), chip(c.opinion, 'Zgoda na opinię')],
      storage: this.storageVals(car.id),
      storageSets: !!this.state.tireStorageOn && this.storageVals(car.id).hasSets,
      storageEmpty: !!this.state.tireStorageOn && this.storageVals(car.id).empty,
      cars: c.cars.map((x, i) => ({
        index: String(i),
        name: x.brand + ' ' + x.model,
        meta: [x.plate, x.year].filter(Boolean).join(' · '),
        tireFlag: TIRES[x.id] ? TIRES[x.id].season : '',
        tireCode: TIRES[x.id] ? TIRES[x.id].code : '',
        ...seasonBits(TIRES[x.id] ? TIRES[x.id].season : ''),
        hasTireFlag: !!TIRES[x.id],
        tireFlagOn: !!this.state.tireStorageOn && !!TIRES[x.id],
        bg: i === idx ? 'var(--tk-surface-2)' : 'var(--tk-surface)',
        marker: i === idx ? 'var(--tk-brand)' : 'transparent',
        rowBorder: i === c.cars.length - 1 ? 'transparent' : 'var(--tk-border-2)',
      })),
      car: {
        name: car.brand + ' ' + car.model,
        plate: car.plate || '-',
        vin: car.vin || '-',
        year: car.year || '-',
        engine: car.engine || '-',
        visits: car.visits.map((v, i) => {
          const st = ST[v.st];
          return {
            id: v.id,
            date: v.date,
            service: v.service,
            statusName: st.name,
            statusDot: st.dot,
            statusBg: st.bg,
            statusColor: st.color,
            price: v.price ? v.price + ' zł' : '-',
            rowBorder: i === car.visits.length - 1 ? 'transparent' : 'var(--tk-border-2)',
          };
        }),
      },
    };
  }

  openEdit(mode) {
    const c = CLIENTS.find((x) => x.id === this.state.clientId) || CLIENTS[0];
    const idx = Math.min(this.state.carIdx, c.cars.length - 1);
    const cars = c.cars.map((x, i) => ({
      id: x.id, brand: x.brand, model: x.model, year: x.year || '', engine: x.engine || '',
      plate: x.plate || '', vin: x.vin || '', isNew: false,
      expanded: mode === 'edit-vehicle' && i === idx,
    }));
    let selectedCarId = cars[idx] ? cars[idx].id : (cars[0] && cars[0].id) || null;
    if (mode === 'add-vehicle') {
      const fresh = { id: 'new-' + Date.now(), brand: '', model: '', year: '', engine: '', plate: '', vin: '', isNew: true, expanded: true };
      cars.forEach((x) => { x.expanded = false; });
      cars.unshift(fresh);
      selectedCarId = fresh.id;
    }
    this.setState({
      editMode: mode,
      editForm: {
        phone: c.phone, name: c.name, email: c.email || '',
        priceGroup: this.clientGroup(c.id),
        invoice: Object.assign(
          { on: false, expanded: false, country: 'Polska', nip: '', nipBlurred: false, fetched: false, company: '', street: '', zip: '', city: '' },
          (this.state.clientInvoice || {})[c.id] || {}
        ),
        sms: !!c.sms, mail: !!c.mail, opinion: !!c.opinion, cars, selectedCarId,
      },
    });
  }

  editVals() {
    const mode = this.state.editMode;
    const f = this.state.editForm;
    if (!mode || !f) return null;
    const titles = { 'edit-client': 'Dane klienta', 'add-vehicle': 'Pojazdy', 'edit-vehicle': 'Pojazdy' };
    const newCount = f.cars.filter((c) => c.isNew).length;
    const consent = (key, on, label) => ({
      key, label,
      checked: on ? 'true' : 'false',
      trackBg: on ? 'var(--tk-brand)' : 'var(--tk-text-3)',
      knobLeft: on ? '25.625px' : '1.625px',
    });
    return {
      title: titles[mode] || 'Klient',
      showClient: mode === 'edit-client',
      clientBorder: mode === 'edit-client' ? 'transparent' : 'var(--tk-border-2)',
      showCars: mode !== 'edit-client',
      showCarsHeader: mode !== 'edit-vehicle' && mode !== 'add-vehicle',
      canAddCar: newCount < 1,
      phone: f.phone,
      name: f.name,
      email: f.email,
      inv: this.invVals('editForm', 'inv-country'),
      groupSel: (() => {
        const open = this.state.openSelect === 'client-group';
        const has = !!f.priceGroup;
        const list = (this.state.priceGroups || DEFAULT_PRICE_GROUPS).map((g) => ({
          value: g.name,
          label: g.pct ? g.name + ' · ' + g.pct + '%' : g.name,
        }));
        const cur = f.priceGroup || '';
        return {
          key: 'client-group',
          value: f.priceGroup || '',
          hasValue: has,
          open: open,
          border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
          bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
          labelSize: has ? '12px' : '16px',
          labelLine: has ? '16px' : '20px',
          chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
          chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
          options: list.map((o) => ({
            value: o.value,
            label: o.label,
            selected: o.value === cur,
            bg: o.value === cur ? 'var(--tk-surface-2)' : 'transparent',
          })),
        };
      })(),
      consents: [
        consent('sms', f.sms, 'Czy klient wyraził zgodę na otrzymywanie SMS-ów/telefonów z ofertami i treściami marketingowymi?'),
        consent('mail', f.mail, 'Czy klient wyraził zgodę na otrzymywanie E-maili z ofertami i treściami marketingowymi?'),
        consent('opinion', f.opinion, 'Czy klient wyraził zgodę na otrzymywanie maili i SMS-ów z prośbą o pozostawienie opinii na portalu DobryMechanik.pl?'),
      ],
      cars: f.cars.map((c) => {
        const checked = c.id === f.selectedCarId;
        const title = [c.brand, c.model].filter(Boolean).join(' ') || 'Nowy pojazd';
        void checked;
        const mkSelect = (field, label, value, options) => {
          const key = c.id + '::' + field;
          const open = this.state.openSelect === key;
          const has = !!value;
          return {
            key, label, value,
            hasValue: has,
            open,
            border: open ? '2px solid var(--tk-brand-bd)' : '1px solid var(--tk-border-strong)',
            bodyPad: open ? (has ? '8px 12px' : '19px 12px') : (has ? '9px 13px 13px 13px' : '20px 13px'),
            labelSize: has ? '12px' : '16px',
            labelLine: has ? '16px' : '20px',
            chevronRotate: open ? 'rotate(180deg)' : 'rotate(0deg)',
            chevronColor: open ? 'var(--tk-brand-fg)' : 'var(--tk-text-2)',
            options: options.map((o) => ({ value: o, selected: o === value, bg: o === value ? 'var(--tk-surface-2)' : 'transparent' })),
          };
        };
        return {
          id: c.id, title, brand: c.brand, model: c.model, year: c.year,
          engine: c.engine, plate: c.plate, vin: c.vin,
          selectsRow1: [ 
            mkSelect('brand', 'Marka*', c.brand, Object.keys(BRANDS)),
            mkSelect('model', 'Model*', c.model, BRANDS[c.brand] || []),
          ],
          selectsRow2: [
            mkSelect('year', 'Rok produkcji (opcjonalnie)', c.year, YEARS),
          ],
          expanded: c.expanded,
          arrowRotate: c.expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          removable: c.isNew && f.cars.length > 1,
          radioBorder: checked ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
          radioBg: checked ? 'radial-gradient(var(--tk-brand) 0 5px, transparent 6px), var(--tk-surface)' : 'var(--tk-surface)',
        };
      }),
    };
  }

  renderVals() {
    const s = this.state;
    const slotH = this.slotH();
    const slots = [];
    for (let i = 0; i < 96; i += 1) {
      const isHour = i % 4 === 0;
      slots.push({
        row: i + 1,
        label: isHour ? fromMin(i * SLOT_MIN) : '',
        labelColor: isHour ? 'var(--tk-text)' : 'var(--tk-text-2)',
        border: i === 0 ? 'transparent' : (isHour ? 'var(--tk-border)' : 'rgba(220,224,230,0.5)'),
      });
    }

    const filtered = this.filteredClients();
    const perPage = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const page = Math.min(s.page, totalPages);
    const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
    const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, filtered.length);

    const detail = this.clientDetail();
    const evd = this.eventDetails();
    const groups = s.priceGroups || DEFAULT_PRICE_GROUPS;
    const draft = s.groupDraft || { name: '', pct: '35', mode: 'pct', isDefault: false, editing: null };
    const connected = s.connectedSuppliers || DEFAULT_SUPPLIERS;
    const sDraft = s.supplierDraft || { name: '', fields: {}, editing: null };
    const assignDays = this.assignDays();

    return {
      isCalendar: s.screen === 'calendar',
      isCalendarRef: false,
      calDisplay: 'none',
      refFrameRef: (el) => {
        this.__refFrame = el;
        if (el) this.pollRefFrame();
      },
      refFrameOpacity: s.refReady ? '1' : '0',
      refFrameLoad: () => this.setupRefFrame(),
      isSettings: s.screen === 'settings',
      settingsColumns: SETTINGS_COLUMNS.map((col) => ({
        cards: col.cards.map((c) => ({
          title: c.title,
          rows: c.rows.map((r, i) => ({
            key: r.key, title: r.title, subtitle: r.subtitle,
            border: i === c.rows.length - 1 ? '1px solid transparent' : '1px solid var(--tk-border-2)',
          })),
        })),
      })),
      isFeatureSettings: s.screen === 'featureSettings',
      tiresEnabled: !!s.tireStorageOn,
      feature: {
        stateLabel: s.tireStorageOn ? 'Włączona' : 'Wyłączona',
        icon: s.tireStorageOn ? 'assets/icons/i-checkmark.svg' : 'assets/icons/i-close.svg',
        iconColor: s.tireStorageOn ? 'var(--tk-ok)' : 'var(--tk-text-3)',
        dialogOpen: !!s.featureDialogOpen,
        draftChecked: s.featureDraft ? 'true' : 'false',
        draftTitle: s.featureDraft ? 'Przechowalnia opon włączona' : 'Przechowalnia opon wyłączona',
        trackBg: s.featureDraft ? 'var(--tk-brand)' : 'var(--tk-border)',
        knobLeft: s.featureDraft ? '25.625px' : '1.625px',
      },
      openSettingsRow: (e) => {
        const key = e.currentTarget.dataset.settingsRow;
        if (key === 'interface') this.setState({ screen: 'featureSettings' });
        if (key === 'goods') this.setState({ screen: 'goods' });
        if (key === 'shop') this.setState({ screen: 'garage', garageEdit: null, garageModal: null });
        if (key === 'billing') this.setState({ screen: 'billing', billingEdit: null });
      },
      isGarage: s.screen === 'garage',
      garage: this.garageVals(),
      isBilling: s.screen === 'billing',
      isBillingPick: s.screen === 'billingPick',
      isBillingForm: s.screen === 'billingForm',
      billing: this.billingVals(),
      isGoods: s.screen === 'goods',
      isReports: s.screen === 'reports',
      reports: this.reportsVals(),
      isDocs: s.screen === 'docs',
      docsQuery: s.docsQuery || '',
      setDocsQuery: (e) => this.setState({ docsQuery: e.target.value }),
      docsSearch: (() => {
        const q = s.docsQuery || '';
        return {
          filled: q.length > 0,
          gap: q ? '2px' : '0px',
          pad: q ? '9px 13px' : '20px 13px',
          placeholder: q ? '' : 'Szukaj dokumentu',
        };
      })(),
      addDoc: () => this.setState({ screen: 'docUpload', docUploadPct: 0, docRows: null }),
      isDocDetail: s.screen === 'docDetail',
      bulkBar: s.screen === 'docDetail' && (s.docSel || []).length > 0,
      bulkLabel: 'Wybrano: ' + (s.docSel || []).length,
      clearDocSel: () => this.setState({ docSel: [] }),
      openAssign: () => {
        this.setState({ assignModal: true, assignQuery: '', assignPick: null, assignWs: 'all' });
        this.scrollAssignToToday();
      },
      closeAssign: () => {
        if (this.assignTimer) { clearInterval(this.assignTimer); this.assignTimer = null; }
        this.setState({ assignModal: false });
      },
      assignModal: !!s.assignModal,
      assignQuery: s.assignQuery || '',
      setAssignQuery: (e) => this.setState({ assignQuery: e.target.value }),
      assignSearch: (() => {
        const q = s.assignQuery || '';
        return {
          filled: q.length > 0,
          placeholder: q.length > 0 ? '' : 'Szukaj — rejestracja, auto, klient',
          gap: q.length > 0 ? '2px' : '0px',
          pad: q.length > 0 ? '9px 13px 9px 0' : '0 13px 0 0',
        };
      })(),
      assignRef: this.assignRef,
      evScrollRef: this.evScrollRef,
      assignChips: [
        { id: 'all', title: 'Wszystkie stanowiska' },
        { id: 'w3', title: 'Opony i wulkanizacja', border: 'var(--tk-info)' },
        { id: 'w1', title: 'Mechanika ogólna', border: 'var(--tk-ok)' },
        { id: 'w2', title: 'Serwis klimatyzacji', border: 'var(--tk-cyan)' },
        { id: 'w4', title: 'Myjnia', border: 'var(--tk-warn)' },
      ].map((w) => {
        const active = (s.assignWs || 'all') === w.id;
        return {
          id: w.id,
          label: w.title,
          hasMarker: w.id !== 'all',
          marker: w.border || 'transparent',
          border: active ? 'var(--tk-brand-bd)' : 'var(--tk-border)',
          bg: active ? 'var(--tk-brand-soft)' : 'var(--tk-surface)',
          pick: () => {
            this.setState({ assignWs: w.id });
            this.scrollAssignToToday();
          },
        };
      }),
      assignDays: assignDays,
      assignEmpty: assignDays.length === 0,
      assignCtaOpacity: s.assignPick ? '1' : '0.5',
      assignCtaCursor: s.assignPick ? 'pointer' : 'not-allowed',
      assignCtaEvents: s.assignPick ? 'auto' : 'none',
      confirmAssign: () => {
        if (!s.assignPick) return;
        const refList = this.refAppointments();
        const refHit = refList ? refList.filter((x) => x.id === s.assignPick)[0] : null;
        const evHit = EVENTS.filter((x) => x.id === s.assignPick)[0];
        const pad2 = (t) => (String(t).length === 4 ? '0' + t : String(t));
        const ev = refHit
          ? { id: refHit.id, brand: refHit.name, model: '', t: pad2(refHit.start), client: refHit.client || '' }
          : evHit;
        if (!ev) return;
        const doc = this.docList().filter((x) => x.nr === s.docId)[0];
        const rows = this.explodeRows(doc ? doc.rows : []);
        const groups = s.priceGroups || DEFAULT_PRICE_GROUPS;
        const clientName = ev.client;
        const clientRec = CLIENTS.filter((c) => c.name === clientName)[0];
        const groupName = clientRec ? this.clientGroup(clientRec.id) : null;
        const group = groups.filter((g) => g.name === groupName)[0]
          || groups.filter((g) => g.isDefault)[0]
          || groups[0];
        const picked = (s.docSel || []).map((i) => rows[i]).filter(Boolean).map((r, i, arr) => {
          const buy = this.docNum(r.price);
          const msrp = this.docNum(r.msrp);
          const useMsrp = group && group.mode === 'msrp' && msrp > 0;
          const net = useMsrp ? msrp * (1 + (group.pct || 0) / 100) : buy * (1 + ((group && group.pct) || 0) / 100);
          const plain = (x) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',');
          const vat = String(parseFloat(r.vat) || 23);
          return {
            name: r.name,
            doc: this.state.docId || '',
            netRaw: net,
            net: this.moneyPl(net),
            gross: this.moneyPl(net * (1 + (parseFloat(r.vat) || 23) / 100)),
            border: i === arr.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            // pola potrzebne, gdy pozycja trafi do konfiguratora wyceny
            indeks: r.code || '',
            producent: r.producer || '',
            unit: r.unit || 'Sztuka',
            vat: vat,
            qty: '1',
            cena: plain(net),
            koszt: plain(buy),
            kosztBrutto: plain(buy * (1 + parseFloat(vat) / 100)),
            grupa: group ? group.name : '',
          };
        });
        const n = (s.docSel || []).length;
        const word = n === 1 ? 'pozycję' : (n < 5 ? 'pozycje' : 'pozycji');
        this.setState({
          assignModal: false,
          docSel: [],
          assignedVisitId: ev.id,
          visitParts: Object.assign({}, s.visitParts, {
            [ev.id]: ((s.visitParts || {})[ev.id] || []).concat(picked).map((p, i, arr) => Object.assign({}, p, { border: i === arr.length - 1 ? 'transparent' : 'var(--tk-border-2)' })),
          }),
          assignedVisitCar: (ev.brand + ' ' + (ev.model || '')).trim(),
          assignedVisitTime: ev.t,
          assignToast: 'Przypisano do wizyty ' + (ev.brand + ' ' + (ev.model || '')).trim() + ' · ' + ev.t + '.',
          assignToastRun: false,
        });
        if (this.__assignToastTimer) clearTimeout(this.__assignToastTimer);
        if (this.__assignRingTimer) clearTimeout(this.__assignRingTimer);
        this.__assignRingTimer = setTimeout(() => {
          if (this.state.assignToast) this.setState({ assignToastRun: true });
        }, 60);
        this.__assignToastTimer = setTimeout(() => this.setState({ assignToast: '', assignToastRun: false }), 10000);
      },
      wycConfigOpen: !!s.wycConfigSrc,
      offerConfigOpen: !!s.offerConfigSrc,
      offerConfigSrc: s.offerConfigSrc || '',
      fvConfigOpen: !!s.fvConfigSrc,
      fvConfigDisplay: s.fvSellerEdit ? 'none' : 'flex',
      fvConfigSrc: s.fvConfigSrc || '',
      closeWycConfig: () => this.closeWycConfig(),
      wycConfigSrc: s.wycConfigSrc || '',
      wycConfigRef: (el) => {
        if (!el || this.__wycFrame === el) return;
        this.__wycFrame = el;
        el.addEventListener('load', () => {
          if (!this.__wycFocus) return;
          const fx = this.__wycFocus; this.__wycFocus = null;
          try { el.contentWindow.postMessage({ __wycFocus: fx }, '*'); } catch (e) {}
        });
      },
      assignToast: s.assignToast || '',
      assignToastRing: s.assignToastRun ? '87.96' : '0',
      closeAssignToast: () => this.setState({ assignToast: '', assignToastRun: false }),
      hasToastAction: !!s.assignedVisitId,
      openAssignedVisit: () => {
        const vid = s.assignedVisitId;
        if (!vid) return;
        this.setState({
          assignToast: '',
          assignToastRun: false,
          navKey: 'calendar',
          screen: 'calendar',
          eventId: vid,
          evTab: 'wycena',
        });
      },
      backToDocs: () => this.setState({ screen: 'docs' }),
      editDoc: () => {
        const all = this.docList();
        const doc = all.filter((x) => x.nr === s.docId)[0] || all[0];
        this.setState({
          screen: 'docReview',
          docEditing: doc.nr,
          docSnack: false,
          docDraft: { supplier: doc.supplier, nr: doc.nr, ext: doc.ext, date: doc.date },
          docRows: this.explodeRows(doc.rows),
        });
      },
      docDetail: (() => {
        const all = this.docList();
        const doc = all.filter((x) => x.nr === s.docId)[0] || all[0] || {};
        const st = (s.docStatuses || {})[doc.nr] || doc.status || 'W trakcie';
        const t = st === 'Dostarczony'
          ? { color: 'var(--tk-ok)', bg: 'var(--tk-ok-soft)', dot: 'var(--tk-ok)' }
          : (st === 'Anulowany'
            ? { color: 'var(--tk-text-2)', bg: 'var(--tk-surface-3)', dot: 'var(--tk-text-3)' }
            : { color: 'var(--tk-brand-fg)', bg: 'var(--tk-brand-soft)', dot: 'var(--tk-brand-fg)' });
        const source = doc.rows || [];
        const rows = [];
        source.forEach((r) => {
          const q = parseInt(r.qty, 10) || 1;
          for (let k = 0; k < q; k += 1) rows.push(Object.assign({}, r, { qty: '1' }));
        });
        const num = (x) => this.docNum(x);
        const tot = this.docTotals(source);
        const net = tot.net;
        const vat = tot.vat;
        const sel = s.docSel || [];
        const allOn = rows.length > 0 && sel.length === rows.length;
        const someOn = sel.length > 0 && !allOn;
        return {
          nr: doc.nr,
          ext: doc.ext,
          date: doc.date,
          supplier: doc.supplier,
          source: (s.docsList && s.docsList.some((x) => x.nr === doc.nr && !DOC_SEED.some((y) => y.nr === x.nr))) ? 'Dodany ręcznie' : 'Integracja B2B',
          supplierName: (SUPPLIER_INFO[doc.supplier] || {}).name || doc.supplier || '',
          supplierClient: [(SUPPLIER_INFO[doc.supplier] || {}).branchShort, (SUPPLIER_INFO[doc.supplier] || {}).client].filter(Boolean).join(' · ') || '—',
          supplierNipLine: 'NIP ' + ((SUPPLIER_INFO[doc.supplier] || {}).nip || '—'),
          allBorder: (allOn || someOn) ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
          allBg: (allOn || someOn) ? 'var(--tk-brand)' : 'var(--tk-surface)',
          allOpacity: (allOn || someOn) ? '1' : '0',
          allIcon: someOn ? 'i-minus.svg' : 'i-checkmark.svg',
          toggleAll: () => this.setState({ docSel: allOn ? [] : rows.map((r, i) => i) }),
          status: st,
          statusColor: t.color,
          statusBg: t.bg,
          statusDot: t.dot,
          count: String(rows.reduce((a, r) => a + (parseInt(r.qty, 10) || 1), 0)),
          totalNet: this.moneyPl(net),
          totalGross: this.moneyPl(net + vat),
          rows: rows.map((r, i) => ({
            name: r.name,
            code: r.code,
            producer: r.producer || '—',
            unit: r.unit || 'Sztuka',
            qty: r.qty,
            priceLabel: this.moneyPl(num(r.price)),
            msrpLabel: r.msrp ? this.moneyPl(num(r.msrp)) : '—',
            msrpColor: r.msrp ? 'var(--black)' : 'var(--tk-text-3)',
            vatLabel: (r.vat || '23') + '%',
            net: this.moneyPl(num(r.qty) * num(r.price)),
            gross: this.moneyPl(num(r.qty) * num(r.price) * (1 + (parseFloat(r.vat) || 0) / 100)),
            border: i === rows.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            rowBg: sel.indexOf(i) !== -1 ? 'var(--tk-surface-2)' : 'var(--tk-surface)',
            boxBorder: sel.indexOf(i) !== -1 ? 'var(--tk-brand-bd)' : 'var(--tk-border-strong)',
            boxBg: sel.indexOf(i) !== -1 ? 'var(--tk-brand)' : 'var(--tk-surface)',
            boxOpacity: sel.indexOf(i) !== -1 ? '1' : '0',
            toggle: () => this.setState((st) => {
              const cur = st.docSel || [];
              return { docSel: cur.indexOf(i) !== -1 ? cur.filter((k) => k !== i) : cur.concat([i]) };
            }),
          })),
        };
      })(),
      isDocUpload: s.screen === 'docUpload',
      isDocReview: s.screen === 'docReview',
      docReviewTitle: s.docEditing ? 'Edytuj dokument' : 'Sprawdź dane dokumentu',
      docSnack: {
        open: !!s.docSnack,
        text: 'Dokument FV-88213-08-2026.pdf zaczytany poprawnie.',
        ringOffset: s.docSnackRun ? '87.96' : '0',
      },
      closeDocSnack: () => this.setState({ docSnack: false }),
      closeDocFlow: () => (s.docEditing
        ? this.setState({ screen: 'docDetail', docEditing: null, docDraft: null, docRows: null, docUploadPct: 0 })
        : this.setState({ screen: 'docs', docUploadPct: 0 })),
      startDocUpload: () => this.runDocUpload(),
      docUpload: {
        idle: !s.docUploadPct,
        busy: !!s.docUploadPct,
        file: 'FV-88213-08-2026.pdf',
        percent: (s.docUploadPct || 0) + '%',
        stage: (s.docUploadPct || 0) < 70 ? 'Wgrywanie pliku…' : 'Analizujemy dokument…',
      },
      docReview: (() => {
        const d = s.docDraft || DOC_DRAFT;
        const rows = s.docRows || DOC_DRAFT_ROWS;
        const num = (t) => parseFloat(String(t).replace(/\s/g, '').replace(',', '.')) || 0;
        const vatOf = (r) => (parseFloat(String(r.vat || '23').replace(',', '.')) || 0) / 100;
        const net = rows.reduce((a, r) => a + num(r.qty) * num(r.price), 0);
        const vatSum = rows.reduce((a, r) => a + num(r.qty) * num(r.price) * vatOf(r), 0);
        return {
          file: 'FV-88213-08-2026.pdf',
          supplier: d.supplier, nr: d.nr, ext: d.ext, date: d.date,
          f: {
            supplier: this.dsFieldState(d.supplier),
            nr: this.dsFieldState(d.nr),
            ext: this.dsFieldState(d.ext),
            date: this.dsFieldState(d.date),
          },
          countLabel: rows.length + (rows.length === 1 ? ' pozycja' : (rows.length < 5 ? ' pozycje' : ' pozycji')),
          totalNet: this.moneyPl(net),
          totalVat: this.moneyPl(vatSum),
          totalGross: this.moneyPl(net + vatSum),
          rows: rows.map((r, i) => ({
            name: r.name, code: r.code, producer: r.producer || '', qty: r.qty, price: r.price,
            unit: r.unit || 'Sztuka', vat: r.vat || '23', msrp: r.msrp || '',
            netPlain: (num(r.qty) * num(r.price)).toFixed(2).replace('.', ','),
            grossPlain: r.grossEdit !== undefined && r.grossEdit !== null
              ? r.grossEdit
              : (num(r.qty) * num(r.price) * (1 + vatOf(r))).toFixed(2).replace('.', ','),
            msrpPlain: r.msrp ? r.msrp : '—',
            unitLabel: r.unit || 'Sztuka',
            net: this.moneyPl(num(r.qty) * num(r.price)),
            vatValue: this.moneyPl(num(r.qty) * num(r.price) * vatOf(r)),
            gross: this.moneyPl(num(r.qty) * num(r.price) * (1 + vatOf(r))),
            border: i === rows.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            setName: (e) => this.patchDocRow(i, { name: e.target.value }),
            setCode: (e) => this.patchDocRow(i, { code: e.target.value }),
            setProducer: (e) => this.patchDocRow(i, { producer: e.target.value }),
            setUnit: (e) => this.patchDocRow(i, { unit: e.target.value }),

            setVat: (e) => this.patchDocRow(i, { vat: e.target.value, grossEdit: null }),
            setQty: (e) => this.patchDocRow(i, { qty: e.target.value, grossEdit: null }),
            setPrice: (e) => this.patchDocRow(i, { price: e.target.value, grossEdit: null }),
            setGross: (e) => {
              const raw = e.target.value;
              const g = parseFloat(String(raw).replace(/\s/g, '').replace(',', '.'));
              const qty = 1;
              const rate = 1 + vatOf(r);
              if (isNaN(g)) {
                this.patchDocRow(i, { grossEdit: raw });
                return;
              }
              this.patchDocRow(i, {
                grossEdit: raw,
                price: (g / rate / qty).toFixed(2).replace('.', ','),
              });
            },
            remove: () => this.setState((st) => ({ docRows: (st.docRows || DOC_DRAFT_ROWS).filter((x, k) => k !== i) })),
          })),
        };
      })(),
      unitOptions: ['Sztuka', 'Opakowanie', 'Zestaw', 'Litr', 'Komplet'],
      vatOptions: ['23', '8', '5', '0'],
      setDocSupplier: (e) => this.patchDocDraft({ supplier: e.target.value }),
      setDocNr: (e) => this.patchDocDraft({ nr: e.target.value }),
      setDocExt: (e) => this.patchDocDraft({ ext: e.target.value }),
      setDocDate: (e) => this.patchDocDraft({ date: e.target.value }),
      addDocRow: () => this.setState((st) => ({ docRows: (st.docRows || DOC_DRAFT_ROWS).concat([{ name: '', code: '', unit: 'Sztuka', qty: '1', price: '0,00', vat: '23', msrp: '' }]) })),
      saveNewDoc: () => {
        const d = this.state.docDraft || DOC_DRAFT;
        const rows = this.state.docRows || DOC_DRAFT_ROWS;
        const num = (t) => parseFloat(String(t).replace(/\s/g, '').replace(',', '.')) || 0;
        const net = rows.reduce((a, r) => a + num(r.qty) * num(r.price), 0);
        const pieces = rows.reduce((a, r) => a + (parseInt(r.qty, 10) || 1), 0);
        const editing = this.state.docEditing;
        if (editing) {
          this.setState({
            screen: 'docDetail',
            docId: d.nr,
            docEditing: null,
            docDraft: null,
            docRows: null,
            docsList: saveDocs(this.docList().map((x) => (x.nr === editing
              ? Object.assign({}, x, { nr: d.nr, ext: d.ext, supplier: d.supplier, date: d.date, rows: rows })
              : x))),
          });
          return;
        }
        const nr = d.nr || DOC_DRAFT.nr;
        const back = this.state.docReturn;
        if (back) {
          this.setState({
            docReturn: null,
            docUploadPct: 0,
            docDraft: null,
            docRows: null,
            docSel: [],
            navKey: back.navKey,
            screen: back.screen,
            eventId: back.eventId,
            docsList: saveDocs([{ nr: nr, ext: d.ext, supplier: d.supplier, date: d.date, status: 'Dostarczony', rows: rows }].concat(this.docList())),
          }, () => {
            if (back.from === 'offer') this.openOfferConfig(back.visit, { pick: nr });
            else if (back.from === 'invoice') this.openInvoiceConfig(back.visit, { force: true, pick: nr });
            else this.openWycConfig(back.visit, null, { pick: nr });
          });
          return;
        }
        this.setState({
          // po zapisie wchodzimy w zapisany dokument, nie wracamy na listę
          screen: 'docDetail',
          docId: nr,
          docUploadPct: 0,
          docDraft: null,
          docRows: null,
          docSel: [],
          docsList: saveDocs([{
            nr: nr, ext: d.ext, supplier: d.supplier, date: d.date,
            status: 'Dostarczony', rows: rows,
          }].concat(this.docList())),
        });
      },
      docs: (() => {
        const q = (s.docsQuery || '').toLowerCase();
        const rows = this.docList().filter((d) => !q
          || d.nr.toLowerCase().indexOf(q) !== -1
          || d.ext.toLowerCase().indexOf(q) !== -1
          || d.supplier.toLowerCase().indexOf(q) !== -1);
        const tone = (st) => (st === 'Dostarczony'
          ? { color: 'var(--tk-ok)', bg: 'var(--tk-ok-soft)', dot: 'var(--tk-ok)' }
          : (st === 'Anulowany'
            ? { color: 'var(--tk-text-2)', bg: 'var(--tk-surface-3)', dot: 'var(--tk-text-3)' }
            : { color: 'var(--tk-brand-fg)', bg: 'var(--tk-brand-soft)', dot: 'var(--tk-brand-fg)' }));
        return rows.map((d, i) => {
          const st = (s.docStatuses || {})[d.nr] || d.status;
          const t = tone(st);
          const open = s.openDocStatus === d.nr;
          const tot = this.docTotals(d.rows);
          return Object.assign({}, d, {
            status: st,
            items: String(tot.pieces),
            net: this.moneyPl(tot.net),
            gross: this.moneyPl(tot.gross),
            statusColor: t.color,
            statusBg: t.bg,
            statusDot: t.dot,
            statusOpen: open,
            statusChevron: open ? 'rotate(180deg)' : 'rotate(0deg)',
            toggleStatus: (e) => {
              e.stopPropagation();
              this.setState((prev) => ({ openDocStatus: prev.openDocStatus === d.nr ? null : d.nr }));
            },
            statusOptions: DOC_STATUSES.map((o) => ({
              value: o,
              selected: o === st,
              bg: o === st ? 'var(--tk-surface-2)' : 'transparent',
              dot: tone(o).dot,
              select: (e) => {
                e.stopPropagation();
                this.setState((prev) => ({
                  docStatuses: Object.assign({}, prev.docStatuses, { [d.nr]: o }),
                  openDocStatus: null,
                }));
              },
            })),
            rowBorder: i === rows.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            open: () => this.setState({ screen: 'docDetail', docId: d.nr, docSel: [] }),
          });
        });
      })(),
      docsEmpty: this.docList().filter((d) => {
        const q = (s.docsQuery || '').toLowerCase();
        return !q || d.nr.toLowerCase().indexOf(q) !== -1 || d.ext.toLowerCase().indexOf(q) !== -1 || d.supplier.toLowerCase().indexOf(q) !== -1;
      }).length === 0,
      isGroupForm: s.screen === 'groupForm',
      isSupplierForm: s.screen === 'supplierForm',
      goSettings: () => this.setState({ screen: 'settings' }),
      goGoods: () => {
        const back = s.groupReturn;
        if (back) {
          this.setState({ screen: 'client', clientId: back.clientId, editMode: back.editMode, editForm: back.editForm, groupReturn: null });
          return;
        }
        this.setState({ screen: 'goods' });
      },
      priceGroups: groups.map((g, i) => ({
        name: g.name,
        modeLabel: g.mode === 'msrp' ? 'Sugerowana cena producenta' : 'Narzut procentowy',
        pctLabel: g.mode === 'msrp' && !g.pct ? '—' : '+' + g.pct + ' %',
        isDefault: !!g.isDefault,
        rowBorder: i === groups.length - 1 ? 'transparent' : 'var(--tk-border-2)',
      })),
      newPriceGroup: () => this.setState({
        screen: 'groupForm',
        groupDraft: { name: '', pct: '35', mode: 'pct', isDefault: false, editing: null },
      }),
      groupNameField: null,
      editPriceGroup: (e) => {
        const name = e.currentTarget.dataset.group;
        const g = groups.filter((x) => x.name === name)[0];
        if (!g) return;
        this.setState({
          screen: 'groupForm',
          groupDraft: { name: g.name, pct: String(g.pct), mode: g.mode, isDefault: !!g.isDefault, editing: g.name },
        });
      },
      groupForm: {
        title: draft.editing ? 'Edytuj grupę cenową' : 'Dodaj grupę cenową',
        name: draft.name,
        pct: draft.pct,
        nameField: this.dsFieldState(draft.name),
        pctField: this.dsFieldState(draft.pct),
        pctLabel: draft.mode === 'msrp' ? 'Narzut procentowy (opcjonalnie)' : 'Narzut procentowy',
        pctHint: draft.mode === 'msrp'
          ? 'Cenę bierzemy z sugerowanej ceny producenta. Procent doliczymy tylko wtedy, gdy go wpiszesz.'
          : 'Procent doliczany do ceny zakupu części. Po nim Zilo wylicza cenę sprzedaży w wycenie.',
        defaultChecked: draft.isDefault ? 'true' : 'false',
        trackBg: draft.isDefault ? 'var(--tk-brand)' : 'var(--tk-text-3)',
        trackBgHover: draft.isDefault ? 'var(--tk-brand-hover)' : 'var(--tk-text-3)',
        knobLeft: draft.isDefault ? '25.625px' : '1.625px',
        modes: [
          { key: 'pct', label: 'Narzut procentowy', desc: 'Cena sprzedaży = cena zakupu + wskazany procent.' },
          { key: 'msrp', label: 'Sugerowana cena producenta', desc: 'Cena sprzedaży z sugerowanej ceny producenta. Procent opcjonalny.' },
        ].map((md) => ({
          key: md.key, label: md.label, desc: md.desc,
          border: draft.mode === md.key ? 'var(--tk-brand-bd)' : 'var(--tk-border)',
          bg: draft.mode === md.key ? 'var(--tk-surface-2)' : 'var(--tk-surface)',
          ringColor: draft.mode === md.key ? 'var(--tk-brand)' : 'var(--tk-border)',
          dot: draft.mode === md.key ? 'var(--tk-brand-fg)' : 'transparent',
        })),
      },
      setGroupName: (e) => this.patchGroupDraft({ name: e.target.value }),
      setGroupPct: (e) => this.patchGroupDraft({ pct: e.target.value }),
      setGroupMode: (e) => {
        const mode = e.currentTarget.dataset.mode;
        if (mode === draft.mode) return;
        this.patchGroupDraft({ mode: mode, pct: mode === 'msrp' ? '' : (draft.pct || '35') });
      },
      toggleGroupDefault: () => this.patchGroupDraft({ isDefault: !draft.isDefault }),
      savePriceGroup: () => {
        const name = (draft.name || '').trim() || 'Nowa grupa cenowa';
        const pct = parseFloat(String(draft.pct || '0').replace(',', '.')) || 0;
        const next = groups.map((g) => Object.assign({}, g, draft.isDefault ? { isDefault: false } : {}));
        const idx = next.findIndex((g) => g.name === draft.editing);
        const row = { name: name, pct: pct, mode: draft.mode, isDefault: !!draft.isDefault };
        if (idx >= 0) next[idx] = row; else next.push(row);
        if (!next.some((g) => g.isDefault)) next[0].isDefault = true;
        const back = s.groupReturn;
        if (back) {
          this.setState({
            priceGroups: next,
            screen: 'client',
            clientId: back.clientId,
            editMode: back.editMode,
            editForm: Object.assign({}, back.editForm, { priceGroup: name }),
            groupReturn: null,
          });
          return;
        }
        this.setState({ priceGroups: next, screen: 'goods' });
      },
      suppliers: connected.map((c, i) => ({
        name: c.name,
        date: c.date,
        status: 'Połączona',
        statusColor: 'var(--tk-ok)',
        statusBg: 'var(--tk-ok-soft)',
        statusDot: 'var(--tk-ok)',
        actionLabel: 'Konfiguruj',
        actionColor: 'var(--tk-text)',
        rowBorder: i === connected.length - 1 ? 'transparent' : 'var(--tk-border-2)',
        action: () => this.setState({
          screen: 'supplierForm',
          supplierDraft: { name: c.name, fields: Object.assign({}, c.fields), editing: c.name },
        }),
      })),
      noSuppliers: connected.length === 0,
      newSupplier: () => this.setState({
        screen: 'supplierPick',
        supplierDraft: { name: '', fields: {}, editing: null },
      }),
      isSupplierPick: s.screen === 'supplierPick',
      closeSupplierFlow: () => this.setState({ screen: 'goods' }),
      supplierOptions: SUPPLIERS.map((sup) => ({
        name: sup.name,
        note: sup.note,
        mark: sup.mark,
        isConnected: connected.some((c) => c.name === sup.name),
        isFree: !connected.some((c) => c.name === sup.name),
      })),
      pickSupplierStep: (e) => {
        const name = e.currentTarget.dataset.supplier;
        const existing = connected.filter((c) => c.name === name)[0];
        this.setState({
          screen: 'supplierForm',
          supplierDraft: {
            name: name,
            fields: existing ? Object.assign({}, existing.fields) : {},
            editing: existing ? name : null,
          },
        });
      },
      supplierForm: {
        title: sDraft.name || 'Połącz hurtownię',
        cta: sDraft.editing ? 'Zapisz połączenie' : 'Połącz hurtownię',
        isEdit: !!sDraft.editing,
        steps: this.supplierSteps(sDraft),
      },
      saveSupplier: () => {
        if (!sDraft.name) return;
        const next = connected.slice();
        const idx = next.findIndex((c) => c.name === sDraft.editing);
        const row = { name: sDraft.name, date: idx >= 0 ? next[idx].date : '21.08.2026', fields: Object.assign({}, sDraft.fields) };
        if (idx >= 0) next[idx] = row; else next.push(row);
        this.setState({ connectedSuppliers: next, screen: 'goods' });
      },
      disconnectSupplier: () => this.setState({
        connectedSuppliers: connected.filter((c) => c.name !== sDraft.editing),
        screen: 'goods',
      }),
      closeFeatureSettings: () => this.setState({ screen: 'settings', featureDialogOpen: false }),
      openFeatureDialog: () => this.setState({ featureDialogOpen: true, featureDraft: !!this.state.tireStorageOn }),
      cancelFeatureDialog: () => this.setState({ featureDialogOpen: false }),
      toggleFeatureDraft: () => this.setState({ featureDraft: !this.state.featureDraft }),
      saveFeatureDialog: () => this.setState({ tireStorageOn: !!this.state.featureDraft, featureDialogOpen: false }),
      moreOpen: !!s.moreOpen,
      moreBg: MORE_NAV.some((n) => n.key === s.navKey) ? 'var(--tk-nav-hover)' : 'transparent',
      moreColor: MORE_NAV.some((n) => n.key === s.navKey) || s.moreOpen ? 'var(--tk-on-fill)' : 'var(--tk-nav-fg)',
      moreRailOpacity: MORE_NAV.some((n) => n.key === s.navKey) ? 1 : 0,
      moreItems: MORE_NAV.map((n) => ({
        key: n.key, label: n.label, icon: n.icon,
        bg: n.key === s.navKey ? 'var(--tk-nav-hover)' : 'transparent',
        railOpacity: n.key === s.navKey ? 1 : 0,
      })),
      toggleMore: () => this.setState({ moreOpen: !this.state.moreOpen }),
      isClients: s.screen === 'clients',
      isClientDetail: s.screen === 'client',
      isEventOpen: !!evd,
      goCalendar: () => this.setState({ screen: 'calendar', eventId: null }, () => this.scrollToDayStart()),
      goClients: () => this.setState({ screen: 'clients', eventId: null }),
      // Raporty zostają w pasku nawet przy wyłączonej przechowalni — tyle że nie wpuszczają dalej
      navItems: NAV.filter((n) => !n.hidden).map((n) => {
        const active = n.key === s.navKey;
        return {
          key: n.key,
          label: n.label,
          icon: active && n.fill ? n.fill : n.icon,
          bg: active ? 'var(--tk-nav-hover)' : 'transparent',
          color: active ? 'var(--tk-on-fill)' : 'var(--tk-nav-fg)',
          railOpacity: active ? 1 : 0,
        };
      }),
      onNavClick: (e) => {
        const key = e.currentTarget.dataset.navKey;
        if (key === 'calendar') this.setState({ navKey: key, screen: 'calendar', eventId: null }, () => this.scrollToDayStart());
        else if (key === 'clients') this.setState({ navKey: key, screen: 'clients', eventId: null });
        else if (key === 'settings') this.setState({ navKey: key, screen: 'settings', eventId: null, moreOpen: false });
        else if (key === 'goods') this.setState({ navKey: key, screen: 'docs', eventId: null, moreOpen: false });
        else if (key === 'reports') { if (this.state.tireStorageOn) this.setState({ navKey: key, screen: 'reports', eventId: null, moreOpen: false }); }
        else this.setState({ navKey: key, moreOpen: false });
      },

      slotH,
      slots,
      weekDays: this.buildDays(),
      weekRef: this.weekRef,
      workspaceChips: WS.map((w) => ({
        id: w.id,
        title: w.title,
        marker: w.border,
        bg: s.selectedWs.includes(w.id) ? 'var(--tk-brand-soft)' : 'var(--tk-surface)',
        borderColor: s.selectedWs.includes(w.id) ? 'var(--tk-brand-bd)' : 'var(--tk-border)',
      })),
      allChipBg: s.selectedWs.length === 0 ? 'var(--tk-brand-soft)' : 'var(--tk-surface)',
      allChipBorder: s.selectedWs.length === 0 ? 'var(--tk-brand-bd)' : 'var(--tk-border)',
      selectAllWorkspaces: () => this.setState({ selectedWs: [] }),
      toggleWorkspace: (e) => {
        const id = e.currentTarget.dataset.wsId;
        this.setState((st) => ({
          selectedWs: st.selectedWs.includes(id) ? st.selectedWs.filter((x) => x !== id) : st.selectedWs.concat([id]),
        }));
      },

      onEventDragStart: (e) => {
        const id = e.currentTarget.dataset.eventId;
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', id);
        }
        this.setState({ dragId: id });
      },
      onEventDragEnd: () => this.setState({ dragId: null, dragOver: null }),
      onDayDragOver: (e) => {
        e.preventDefault();
        if (!this.state.dragId) return;
        const day = e.currentTarget.dataset.day;
        const slot = this.slotIdxFromEvent(e);
        const prev = this.state.dragOver;
        if (!prev || prev.day !== day || prev.slot !== slot) this.setState({ dragOver: { day, slot } });
      },
      onDayDrop: (e) => {
        e.preventDefault();
        const id = this.state.dragId;
        if (!id) return;
        const day = e.currentTarget.dataset.day;
        const slot = this.slotIdxFromEvent(e);
        const dIdx = WEEK.indexOf(day);
        this.setState((st) => ({
          dragId: null,
          dragOver: null,
          events: st.events.map((ev) => (ev.id === id ? { ...ev, d: dIdx, t: fromMin(slot * SLOT_MIN) } : ev)),
        }));
      },
      onResizeStart: (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = e.target.closest('[data-event-id]');
        if (!card) return;
        const id = card.dataset.eventId;
        const ev = this.state.events.find((x) => x.id === id);
        if (!ev) return;
        this.setState({ resize: { id, startY: e.clientY, startDur: ev.dur, current: ev.dur } });
      },
      onEventClick: (e) => {
        if (this.state.resize) return;
        this.setState({ eventId: e.currentTarget.dataset.eventId });
      },

      clientsTotal: CLIENTS.length,
      query: s.query,
      onQueryInput: (e) => this.setState({ query: e.target.value, page: 1 }),
      pageClients: pageItems.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        cars: c.cars.map((car, i) => {
          const t = TIRES[car.id];
          return {
            makeModel: car.brand + ' ' + car.model,
            plate: car.plate || '-',
            vinLabel: car.vin || '-',
            hasVin: !!car.vin,
            lastVisit: car.last || '-',
            rowBorder: i === c.cars.length - 1 ? 'transparent' : 'var(--tk-border-2)',
            hasTires: !!t,
            noTires: !t,
            tireColOn: !!this.state.tireStorageOn,
            tireId: car.id,
            tireSeason: t ? t.season : '',
            tireCode: t ? t.code : '',
            ...seasonBits(t ? t.season : ''),
            tipVisible: s.tireTip === car.id,
            tipTitle: t ? 'Komplet ' + t.code + ' · ' + t.season : '',
            tipMeta: t ? 'Przyjęto: ' + t.received : '',
            tipHasLocation: !!(t && t.location),
            tipLocation: t ? (t.location || '') : '',
            tipCols: t && this.specRows(t.wheels).some((r) => !!r.tread) ? 'auto auto auto auto auto' : 'auto auto auto auto',
            tipHasTread: !!(t && this.specRows(t.wheels).some((r) => !!r.tread)),
            tipWheels: t ? (() => {
              const rows = this.specRows(t.wheels);
              const anyTread = rows.some((r) => !!r.tread);
              return rows.map((r, wi) => ({
                maker: r.maker, size: r.size, rim: r.rim, qty: String(r.qty),
                tread: r.tread || '—', showTread: anyTread,
                rowBorder: wi === 0 ? 'transparent' : 'var(--tk-border-2)',
              }));
            })() : [],
          };
        }),
      })),
      clientsEmpty: pageItems.length === 0,
      filterLabel: s.clientsFilter === 'tires' ? 'Klienci: z oponami' : 'Klienci: wszyscy',
      filterOpen: s.clientsFilterOpen,
      filterChevronRotate: s.clientsFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      filterOptions: [
        { key: 'all', label: 'Wszyscy', selected: s.clientsFilter === 'all', bg: s.clientsFilter === 'all' ? 'var(--tk-surface-2)' : 'transparent' },
        { key: 'tires', label: 'Z oponami w przechowalni', selected: s.clientsFilter === 'tires', bg: s.clientsFilter === 'tires' ? 'var(--tk-surface-2)' : 'transparent' },
      ],
      toggleClientsFilter: () => this.setState({ clientsFilterOpen: !this.state.clientsFilterOpen }),
      pickClientsFilter: (e) => this.setState({ clientsFilter: e.currentTarget.dataset.key, clientsFilterOpen: false, page: 1 }),
      toggleTireSet: (e) => {
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => ({ openTireSet: st.openTireSet === key ? '' : key, openTireMenu: null }));
      },
      tire: this.tireVals(),
      clash: s.seasonClash
        ? {
          open: true,
          seasonGen: s.seasonClash.season === 'Lato' ? 'letnich' : (s.seasonClash.season === 'Całoroczne' ? 'całorocznych' : 'zimowych'),
          code: s.seasonClash.existingCode,
        }
        : { open: false },
      visitTire: this.visitTireVals(),
      vtTable: this.visitTireTable(),
      timeEdit: this.timeEditVals(),
      openTimeEdit: () => {
        const ev = s.events.find((x) => x.id === s.eventId);
        if (!ev) return;
        this.setState({
          timeSelect: null, timeDateOpen: false, wsDropdownOpen: false,
          timeForm: { wsId: ev.ws, date: WEEK[ev.d], from: ev.t, to: fromMin(toMin(ev.t) + ev.dur), notify: false },
        });
      },
      closeTimeEdit: () => this.setState({ timeForm: null, timeSelect: null, timeDateOpen: false, wsDropdownOpen: false }),
      saveTimeEdit: () => {
        const f = this.state.timeForm;
        const id = this.state.eventId;
        this.setState((st) => ({
          timeForm: null, timeSelect: null, timeDateOpen: false, wsDropdownOpen: false,
          events: st.events.map((ev) => (ev.id === id
            ? { ...ev, ws: f.wsId, d: Math.max(0, WEEK.indexOf(f.date)), t: f.from, dur: Math.max(15, toMin(f.to) - toMin(f.from)) }
            : ev)),
        }));
      },
      toggleWsDropdown: () => this.setState({ wsDropdownOpen: !this.state.wsDropdownOpen, timeSelect: null, timeDateOpen: false }),
      pickWorkspace: (e) => {
        const id = e.currentTarget.dataset.wsId;
        this.setState((st) => ({ wsDropdownOpen: false, timeForm: { ...st.timeForm, wsId: id } }));
      },
      toggleTimeDate: () => this.setState({ timeDateOpen: !this.state.timeDateOpen, timeSelect: null, wsDropdownOpen: false }),
      stepTimeMonth: (e) => {
        e.stopPropagation();
        const step = Number(e.currentTarget.dataset.step);
        this.setState((st) => {
          const f = st.timeForm;
          const [y, m] = f.date.split('-').map(Number);
          const base = f.calMonth || { y, m: m - 1 };
          const d = new Date(base.y, base.m + step, 1);
          return { timeForm: { ...f, calMonth: { y: d.getFullYear(), m: d.getMonth() } } };
        });
      },
      pickTimeDate: (e) => {
        e.stopPropagation();
        const v = e.currentTarget.dataset.date;
        if (!v) return;
        this.setState((st) => ({ timeDateOpen: false, timeForm: { ...st.timeForm, date: v } }));
      },
      toggleTimeSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ timeSelect: st.timeSelect === key ? null : key, timeDateOpen: false, wsDropdownOpen: false }));
      },
      pickTimeSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        const val = e.currentTarget.dataset.value;
        this.setState((st) => {
          const f = { ...st.timeForm, [key]: val };
          if (key === 'from' && f.to <= f.from) f.to = fromMin(Math.min(1425, toMin(f.from) + 60));
          return { timeSelect: null, timeForm: f };
        });
      },
      toggleTimeNotify: () => this.setState((st) => ({ timeForm: { ...st.timeForm, notify: !st.timeForm.notify } })),
      visitClient: this.visitClientVals(),
      visitSetsAny: true,
      visitClientSets: this.setPanels(this.visitCarId(), { onlyDrafts: !!s.visitTireDraftOnly }),
      // przy dodawaniu kompletu nagłówek i „Nowy komplet" tylko rozpraszają
      storageHeaderOn: !s.visitTireDraftOnly,
      addVisitSetDraft: (e) => {
        e.stopPropagation();
        const key = 'draft' + Date.now();
        const carId = e.currentTarget.dataset.carId;
        if (carId) {
          this.setState((st) => ({
            visitClientForm: { ...st.visitClientForm, selectedCarId: carId },
            visitTireDrafts: (st.visitTireDrafts || []).concat([key]),
            visitTireForms: { ...(st.visitTireForms || {}), [key]: { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '' } },
            visitTireOpenMap: { ...(st.visitTireOpenMap || {}), [key]: true },
          }));
          return;
        }
        this.setState((st) => ({
          visitTireDrafts: (st.visitTireDrafts || []).concat([key]),
          visitTireForms: { ...(st.visitTireForms || {}), [key]: { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '' } },
          visitTireOpenMap: { ...(st.visitTireOpenMap || {}), [key]: true },
          visitCarOpen: (st.visitClientForm.cars || []).reduce((acc, c) => { acc[c.id] = false; return acc; }, {}),
        }));
      },
      removeVisitSet: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const forms = { ...(st.visitTireForms || {}) };
          const openMap = { ...(st.visitTireOpenMap || {}) };
          delete forms[key];
          delete openMap[key];
          const drafts = (st.visitTireDrafts || []).filter((k) => k !== key);
          if (key.indexOf('::') === -1) {
            return { visitTireForms: forms, visitTireOpenMap: openMap, visitTireDrafts: drafts, visitTireSelect: null };
          }
          const [carId, idx] = key.split('::');
          return {
            visitTireForms: forms, visitTireOpenMap: openMap, visitTireDrafts: drafts, visitTireSelect: null,
            removedSets: { ...st.removedSets, [carId]: (st.removedSets[carId] || []).concat([Number(idx)]) },
          };
        });
      },
      toggleVisitSet: (e) => {
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const carId = this.visitCarId();
          const forms = { ...(st.visitTireForms || {}) };
          if (!forms[key]) {
            const t = this.tireSetsFor(carId).find((x) => carId + '::' + x.__idx === key);
            if (t) forms[key] = this.buildSetForm(carId, t);
          }
          const openMap = { ...(st.visitTireOpenMap || {}) };
          openMap[key] = !openMap[key];
          return { visitTireForms: forms, visitTireOpenMap: openMap, visitTireSelect: null };
        });
      },
      toggleVisitSetSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ visitTireSelect: st.visitTireSelect === key ? null : key }));
      },
      pickVisitSetSelect: (e) => {
        e.stopPropagation();
        const [setKey, rest] = e.currentTarget.dataset.selectId.split('|');
        const parts = rest.split('|');
        const field = parts[0];
        const wheelId = parts[1];
        const val = e.currentTarget.dataset.value;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return { visitTireSelect: null };
          forms[setKey] = field === 'season'
            ? { ...f, season: val }
            : { ...f, wheels: f.wheels.map((w) => (w.id === wheelId ? { ...w, [field]: val } : w)) };
          return { visitTireSelect: null, visitTireForms: forms };
        });
      },
      onVisitSetWheelField: (e) => {
        const setKey = e.currentTarget.dataset.setKey;
        const wheelId = e.currentTarget.dataset.wheelId;
        const field = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return {};
          forms[setKey] = { ...f, wheels: f.wheels.map((w) => (w.id === wheelId ? { ...w, [field]: val } : w)) };
          return { visitTireForms: forms };
        });
      },
      onVisitSetLocation: (e) => {
        const setKey = e.currentTarget.dataset.setKey;
        const val = String(e.target.value || '').slice(0, 40);
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return {};
          forms[setKey] = { ...f, location: val };
          return { visitTireForms: forms };
        });
      },
      onVisitSetNote: (e) => {
        const setKey = e.currentTarget.dataset.setKey;
        const val = e.target.value;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return {};
          forms[setKey] = { ...f, note: val };
          return { visitTireForms: forms };
        });
      },
      copyVisitSetWheel: (e) => {
        e.stopPropagation();
        const setKey = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f || !f.wheels.length) return {};
          const last = f.wheels[f.wheels.length - 1];
          forms[setKey] = { ...f, wheels: f.wheels.concat([{ ...last, id: 'w' + Date.now() }]) };
          return { visitTireForms: forms };
        });
      },
      toggleVisitSetEmail: (e) => {
        e.stopPropagation();
        const setKey = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return {};
          forms[setKey] = { ...f, emailConfirm: !f.emailConfirm };
          return { visitTireForms: forms };
        });
      },
      addVisitSetWheel: (e) => {
        e.stopPropagation();
        const setKey = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f) return {};
          forms[setKey] = { ...f, wheels: f.wheels.concat([{ id: 'w' + Date.now(), maker: '', size: '', rim: '', tread: '', qty: '' }]) };
          return { visitTireForms: forms };
        });
      },
      removeVisitSetWheel: (e) => {
        e.stopPropagation();
        const setKey = e.currentTarget.dataset.setKey;
        const wheelId = e.currentTarget.dataset.wheelId;
        this.setState((st) => {
          const forms = this.setForm(st, setKey);
          const f = forms[setKey];
          if (!f || f.wheels.length < 2) return {};
          forms[setKey] = { ...f, wheels: f.wheels.filter((w) => w.id !== wheelId) };
          return { visitTireForms: forms };
        });
      },
      toggleVisitCar: (e) => {
        const id = e.currentTarget.dataset.carId;
        this.setState((st) => {
          const open = { ...(st.visitCarOpen || {}) };
          open[id] = !open[id];
          return { visitCarOpen: open };
        });
      },
      selectVisitCar: (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.carId;
        this.setState((st) => ({
          visitCarOpen: { ...(st.visitCarOpen || {}), [id]: true },
          visitClientForm: { ...st.visitClientForm, selectedCarId: id },
        }));
      },
      addVisitCar: () => this.setState((st) => {
        const id = 'nc' + Date.now();
        return {
          visitCarOpen: { ...(st.visitCarOpen || {}), [id]: true },
          visitClientForm: {
            ...st.visitClientForm,
            selectedCarId: id,
            cars: st.visitClientForm.cars.concat([{ id, brand: '', model: '', year: '', plate: '', vin: '', engine: '' }]),
          },
        };
      }),
      removeVisitCar: (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.carId;
        this.setState((st) => {
          const cars = st.visitClientForm.cars.filter((c) => c.id !== id);
          const sel = st.visitClientForm.selectedCarId === id ? (cars[0] ? cars[0].id : null) : st.visitClientForm.selectedCarId;
          return { visitClientForm: { ...st.visitClientForm, cars, selectedCarId: sel } };
        });
      },
      toggleVisitCarSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ visitCarSelect: st.visitCarSelect === key ? null : key }));
      },
      pickVisitCarSelect: (e) => {
        e.stopPropagation();
        const [field, carId] = e.currentTarget.dataset.selectId.split('::');
        const val = e.currentTarget.dataset.value;
        this.setState((st) => ({
          visitCarSelect: null,
          visitClientForm: {
            ...st.visitClientForm,
            cars: st.visitClientForm.cars.map((c) => (c.id === carId
              ? { ...c, [field]: val, model: field === 'brand' ? '' : (field === 'model' ? val : c.model) }
              : c)),
          },
        }));
      },
      onVisitCarField: (e) => {
        const carId = e.currentTarget.dataset.carId;
        const field = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({
          visitClientForm: {
            ...st.visitClientForm,
            cars: st.visitClientForm.cars.map((c) => (c.id === carId ? { ...c, [field]: val } : c)),
          },
        }));
      },
      tireSection: { open: !!s.tireSectionOpen && !!s.tireStorageOn },
      closeTireSection: () => this.setState({ tireSectionOpen: false, visitClientForm: null, visitTireForms: {}, visitTireDrafts: [], visitTireSelect: null, visitTireDraftOnly: false }),
      saveTireSection: () => {
        const carId = this.visitCarId();
        const forms = this.state.visitTireForms || {};
        const drafts = this.state.visitTireDrafts || [];
        if (!carId) { this.setState({ tireSectionOpen: false, visitClientForm: null }); return; }
        const toWheels = (ws) => ws.map((w) => ({
          pos: '', maker: w.maker || '', size: w.size || '',
          rim: w.rim || '', tread: w.tread || '', qty: w.qty || '1',
        }));
        const added = [];
        drafts.forEach((k) => {
          const f = forms[k];
          if (!f) return;
          const filled = f.season || f.note || f.wheels.some((w) => w.maker || w.size || w.rim || w.tread || w.qty);
          if (!filled) return;
          const season = f.season || 'Zima';
          added.push({
            season, code: seasonCode(season), location: f.location || '', received: '20.08.2026',
            status: 'in', note: f.note || '', files: [], wheels: toWheels(f.wheels),
          });
        });
        const edits = {};
        Object.keys(forms).forEach((k) => {
          if (drafts.indexOf(k) > -1 || k.indexOf('::') === -1) return;
          const f = forms[k];
          edits[k] = { season: f.season, note: f.note || '', location: f.location || '', wheels: toWheels(f.wheels) };
        });
        this.setState((st) => ({
          tireSectionOpen: false,
          visitClientForm: null,
          visitTireForms: {},
          visitTireDrafts: [],
          visitTireDraftOnly: false,
          editedSets: { ...st.editedSets, ...edits },
          addedSets: added.length ? { ...st.addedSets, [carId]: (st.addedSets[carId] || []).concat(added) } : st.addedSets,
        }));
      },
      openTireSectionWithDraft: (e) => {
        const v = this.renderVals();
        v.openTireSection(e);
        if (!this.state.tireStorageOn) return;
        this.setState({ visitTireDraftOnly: true });
        const key = 'draft' + Date.now();
        this.setState((st) => ({
          visitTireDrafts: (st.visitTireDrafts || []).concat([key]),
          visitTireForms: Object.assign({}, st.visitTireForms, {
            [key]: { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '' },
          }),
          visitTireOpenMap: Object.assign({}, st.visitTireOpenMap, { [key]: true }),
        }));
      },
      openTireSection: (e) => {
        e.stopPropagation();
        if (!this.state.tireStorageOn) return;
        const ev = s.events.find((x) => x.id === s.eventId);
        const client = ev ? CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate)) : null;
        if (!client) return;
        const car = client.cars.find((c) => c.plate === ev.plate) || client.cars[0];
        const sets = this.tireSetsFor(car.id);
        const openMap = {};
        if (sets.length) openMap[car.id + '::' + sets[0].__idx] = true;
        this.setState({
          tireSectionOpen: true,
          visitTireDraftOnly: false,
          visitClientForm: {
            phone: client.phone, name: client.name, email: client.email || '',
            priceGroup: this.clientGroup(client.id),
            sms: !!client.sms, mail: !!client.mail, opinion: !!client.opinion,
            cars: client.cars.map((c) => ({ ...c })),
            selectedCarId: car.id,
            invoice: Object.assign(
              { on: false, expanded: false, country: 'Polska', nip: '', nipBlurred: false, fetched: false, company: '', street: '', zip: '', city: '' },
              (this.state.clientInvoice || {})[client.id] || {}
            ),
          },
          visitCarOpen: client.cars.reduce((acc, c) => { acc[c.id] = false; return acc; }, {}),
          visitTireDrafts: [],
          visitTireForms: {},
          visitTireOpenMap: openMap,
          visitTireSelect: null,
          visitCarSelect: null,
        });
      },
      openClientEditorWithDraft: (e) => {
        e.stopPropagation();
        if (!this.state.tireStorageOn) return;
        const ev = s.events.find((x) => x.id === s.eventId);
        const client = ev ? CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate)) : null;
        if (!client) return;
        const car = client.cars.find((c) => c.plate === ev.plate) || client.cars[0];
        const key = 'draft' + Date.now();
        this.setState({
          tireSectionOpen: true,
          visitTireDraftOnly: false,
          visitClientForm: {
            phone: client.phone, name: client.name, email: client.email || '',
            priceGroup: this.clientGroup(client.id),
            sms: !!client.sms, mail: !!client.mail, opinion: !!client.opinion,
            cars: client.cars.map((c) => ({ ...c })),
            selectedCarId: car.id,
            invoice: Object.assign(
              { on: false, expanded: false, country: 'Polska', nip: '', nipBlurred: false, fetched: false, company: '', street: '', zip: '', city: '' },
              (this.state.clientInvoice || {})[client.id] || {}
            ),
          },
          visitCarOpen: client.cars.reduce((acc, c) => { acc[c.id] = false; return acc; }, {}),
          visitTireDrafts: [key],
          visitTireForms: { [key]: { season: '', wheels: [{ id: 'w0', maker: '', size: '', rim: '', tread: '', qty: '' }], note: '' } },
          visitTireOpenMap: { [key]: true },
          visitTireSelect: null,
          visitCarSelect: null,
        });
      },
      openVisitClientEdit: (e) => {
        e.stopPropagation();
        const ev = s.events.find((x) => x.id === s.eventId);
        const client = ev ? CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate)) : null;
        if (!client) return;
        const car = client.cars.find((c) => c.plate === ev.plate) || client.cars[0];
        this.setState({
          visitClientForm: {
            phone: client.phone, name: client.name, email: client.email || '',
            priceGroup: this.clientGroup(client.id),
            sms: !!client.sms, mail: !!client.mail, opinion: !!client.opinion,
            cars: client.cars.map((c) => ({ ...c })),
            selectedCarId: car.id,
            invoice: Object.assign(
              { on: false, expanded: false, country: 'Polska', nip: '', nipBlurred: false, fetched: false, company: '', street: '', zip: '', city: '' },
              (this.state.clientInvoice || {})[client.id] || {}
            ),
          },
          visitCarOpen: client.cars.length > 1 ? {} : { [car.id]: true },
          visitTireOpenMap: this.tireSetsFor(car.id).length ? {} : { draft0: true },
          visitTireForms: {},
          visitTireDrafts: this.tireSetsFor(car.id).length ? [] : ['draft0'],
          visitTireOpenMapInit: true,
          visitTireSelect: null,
          visitCarSelect: null,
        });
      },
      closeVisitClient: () => this.setState({ visitClientForm: null }),
      saveVisitClient: () => {
        const carId = this.visitCarId();
        const forms = this.state.visitTireForms || {};
        const drafts = this.state.visitTireDrafts || [];
        if (!carId) { this.setState({ visitClientForm: null }); return; }
        const pad = (n) => String(n).padStart(2, '0');
        const today = '13.08.2026';
        const toWheels = (ws) => ws.map((w) => ({
          pos: '', maker: w.maker || '', size: w.size || '',
          rim: w.rim || '', tread: w.tread || '', qty: w.qty || '1',
        }));
        const added = [];
        drafts.forEach((k) => {
          const f = forms[k];
          if (!f) return;
          const filled = f.season || f.note || f.wheels.some((w) => w.maker || w.size || w.rim || w.tread || w.qty);
          if (!filled) return;
          const season = f.season || 'Zima';
          added.push({
            season, code: seasonCode(season), location: f.location || '', received: today,
            status: 'in', note: f.note || '', files: [], wheels: toWheels(f.wheels),
          });
        });
        const edits = {};
        Object.keys(forms).forEach((k) => {
          if (drafts.indexOf(k) > -1 || k.indexOf('::') === -1) return;
          const f = forms[k];
          edits[k] = { season: f.season, note: f.note || '', location: f.location || '', wheels: toWheels(f.wheels) };
        });
        const ev = this.state.events.find((x) => x.id === this.state.eventId);
        const cli = ev ? CLIENTS.find((c) => c.cars.some((car) => car.plate === ev.plate)) : null;
        this.setState((st) => ({
          visitClientForm: null,
          visitTireForms: {},
          visitTireDrafts: [],
          // grupa cenowa zapisuje się w kartotece klienta i obowiązuje kolejne zlecenia
          clientGroups: (() => {
            const g = (st.visitClientForm || {}).priceGroup;
            if (!cli || !g) return st.clientGroups;
            return Object.assign({}, st.clientGroups, { [cli.id]: g });
          })(),
          // dane firmowe zapisują się przy kliencie, tak samo jak z modalu „Dane klienta"
          clientInvoice: (() => {
            if (!cli) return st.clientInvoice;
            const f = (st.visitClientForm || {}).invoice || {};
            const next = Object.assign({}, st.clientInvoice);
            if (f.on && this.nipComplete(f.nip)) next[cli.id] = Object.assign({}, f, { expanded: false });
            else delete next[cli.id];
            return next;
          })(),
          editedSets: { ...st.editedSets, ...edits },
          addedSets: added.length
            ? { ...st.addedSets, [carId]: (st.addedSets[carId] || []).concat(added) }
            : st.addedSets,
        }));
      },
      onVisitClientField: (e) => {
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({ visitClientForm: { ...st.visitClientForm, [key]: val } }));
      },
      onVisitClientToggle: (e) => {
        const key = e.currentTarget.dataset.field;
        this.setState((st) => ({ visitClientForm: { ...st.visitClientForm, [key]: !st.visitClientForm[key] } }));
      },
      toggleVisitTire: () => this.setState({ visitTireOpen: !this.state.visitTireOpen }),
      showVisitTip: () => this.setState({ visitTireTip: true }),
      hideVisitTip: () => this.setState({ visitTireTip: false }),
      toggleVisitTireMenu: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ visitTireMenuOpen: !st.visitTireMenuOpen }));
      },
      deleteVisitTire: (e) => {
        e.stopPropagation();
        const v = this.visitTireVals();
        if (!v.setKey) return;
        const [carId, idxStr] = v.setKey.split('::');
        this.setState((st) => ({
          visitTireMenuOpen: false,
          removedSets: { ...st.removedSets, [carId]: (st.removedSets[carId] || []).concat([Number(idxStr)]) },
        }));
      },
      editVisitTire: (e) => {
        e.stopPropagation();
        this.setState({ visitTireMenuOpen: false });
        const v = this.visitTireVals();
        if (v.setKey) this.openEditFromKey(v.setKey);
      },
      release: this.releaseVals(),
      openRelease: (e) => {
        e.stopPropagation();
        const v = this.visitTireVals();
        if (!v.setKey) return;
        const carId = this.visitCarId();
        const sets = carId ? this.tireSetsFor(carId) : [];
        const hasOther = sets.some((t) => (carId + '::' + t.__idx) !== v.setKey);
        this.setState({
          releaseSelect: null,
          releaseForm: { setKey: v.setKey, outOpen: false, choice: hasOther ? 'existing' : 'new', newSeason: '', newMaker: '', newQty: '4', newSize: '', newRim: '', newTread: '', newExpanded: false, newEmail: false },
        });
      },
      closeRelease: () => this.setState({ releaseForm: null, releaseSelect: null }),
      toggleExistingEmail: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, existingEmail: !st.releaseForm.existingEmail } }));
      },
      toggleNewEmail: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, newEmail: !st.releaseForm.newEmail } }));
      },
      toggleNewMore: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, newExpanded: !st.releaseForm.newExpanded } }));
      },
      toggleReleaseOut: () => this.setState((st) => ({ releaseForm: { ...st.releaseForm, outOpen: !st.releaseForm.outOpen } })),
      showOutTip: () => this.setState({ releaseOutTip: true }),
      hideOutTip: () => this.setState({ releaseOutTip: false }),
      showOptTip: () => this.setState({ releaseOptTip: true }),
      hideOptTip: () => this.setState({ releaseOptTip: false }),
      toggleOptSet: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, optSetOpen: !st.releaseForm.optSetOpen } }));
      },
      pickReleaseOption: (e) => {
        const key = e.currentTarget.dataset.opt;
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, choice: key } }));
      },
      toggleReleaseSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ releaseSelect: st.releaseSelect === key ? null : key }));
      },
      pickReleaseSelect: (e) => {
        e.stopPropagation();
        const val = e.currentTarget.dataset.value;
        const key = e.currentTarget.dataset.selectId || 'newSeason';
        this.setState((st) => ({ releaseSelect: null, releaseForm: { ...st.releaseForm, [key]: val } }));
      },
      onReleaseField: (e) => {
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({ releaseForm: { ...st.releaseForm, [key]: val } }));
      },
      confirmRelease: () => {
        const f = this.state.releaseForm;
        const rv = this.releaseVals();
        const outSeason = rv.outSeason || '';
        const outCode = rv.outCode || '';
        const carId = this.visitCarId();
        let added = null;
        if (f.choice === 'new' && carId) {
          const ns = f.newSeason || 'Zima';
          added = {
            season: ns,
            code: seasonCode(ns),
            location: '', received: '14.08.2026', status: 'in', note: '', files: [],
            wheels: [{ pos: '', maker: f.newMaker || '', size: f.newSize || '', rim: f.newRim || '', tread: f.newTread || '', qty: f.newQty || '4' }],
          };
        }
        this.setState((st) => ({
          releaseForm: null,
          releaseSelect: null,
          setStatus: { ...st.setStatus, [f.setKey]: 'out' },
          addedSets: added ? { ...st.addedSets, [carId]: (st.addedSets[carId] || []).concat([added]) } : st.addedSets,
        }));
        const komplet = ['Komplet', outSeason, outCode && ('nr ' + outCode)].filter(Boolean).join(' ');
        this.ziloToast(
          f.choice === 'existing' ? komplet + ' wydany, drugi przyjęty do przechowalni'
            : f.choice === 'new' ? komplet + ' wydany, nowy przyjęty do przechowalni'
              : komplet + ' wydany klientowi'
        );
      },
      openTireModal: () => this.setState({
        tireSelect: null,
        tireDateOpen: false,
        visitTireMenuOpen: false,
        tireForm: {
          carId: this.currentCarId(),
          season: '', date: '2026-08-14', sameAll: true,
          block: { maker: '', size: '', tread: '', qty: '', rim: '' },
          wheels: [{ id: 'w1', rim: '', maker: '', size: '', tread: '', qty: '1' }],
          location: '', note: '', files: [], emailConfirm: false,
        },
      }),
      deleteTireSet: (e) => {
        e.stopPropagation();
        const [carId, idxStr] = e.currentTarget.dataset.setKey.split('::');
        this.setState((st) => ({
          openTireMenu: null,
          removedSets: { ...st.removedSets, [carId]: (st.removedSets[carId] || []).concat([Number(idxStr)]) },
        }));
      },
      editTireSet: (e) => {
        e.stopPropagation();
        this.openEditFromKey(e.currentTarget.dataset.setKey);
      },
      closeTireModal: () => this.setState({ tireForm: null, tireSelect: null }),
      saveTireSet: () => {
        const f = this.state.tireForm;
        if (!f) return;
        const carId = f.carId || this.currentCarId();
        const pad = (n) => String(n).padStart(2, '0');
        const [y, m, d] = String(f.date).split('-');
        const received = d + '.' + m + '.' + y;
        const wheels = f.wheels.map((w) => ({
          pos: '', maker: w.maker || '', size: w.size || '',
          rim: w.rim || '', tread: w.tread || '', qty: w.qty || '1',
        }));
        if (f.editKey) {
          const [ecar, eidx] = f.editKey.split('::');
          this.setState((st) => {
            const added = (st.addedSets[ecar] || []).slice();
            const baseLen = (TIRE_SETS[ecar] || (TIRES[ecar] ? [1] : [])).length;
            const patch = { season: f.season || 'Zima', received, note: f.note || '', files: (f.files || []).slice(), wheels };
            if (Number(eidx) >= baseLen) {
              const k = Number(eidx) - baseLen;
              if (added[k]) added[k] = { ...added[k], ...patch };
              return { tireForm: null, tireSelect: null, addedSets: { ...st.addedSets, [ecar]: added } };
            }
            return { tireForm: null, tireSelect: null, editedSets: { ...st.editedSets, [f.editKey]: patch } };
          });
          return;
        }
        if (!carId) { this.setState({ tireForm: null, tireSelect: null }); return; }
        const season = f.season || 'Zima';
        const set = {
          season, code: seasonCode(season), location: '', received,
          status: 'in', note: f.note || '', files: (f.files || []).slice(), wheels,
        };
        const clash = this.tireSetsFor(carId).find((t) => t.season === season
          && (this.state.setStatus[carId + '::' + t.__idx] || t.status) === 'in');
        if (clash) {
          this.setState({ seasonClash: { carId, set, existingKey: carId + '::' + clash.__idx, existingCode: clash.code, season } });
          return;
        }
        this.setState((st) => ({
          tireForm: null, tireSelect: null,
          addedSets: { ...st.addedSets, [carId]: (st.addedSets[carId] || []).concat([set]) },
        }));
      },
      cancelSeasonClash: () => this.setState({ seasonClash: null }),

      clashAddNew: () => {
        const c = this.state.seasonClash;
        if (!c) return;
        this.setState((st) => ({
          seasonClash: null, tireForm: null, tireSelect: null,
          addedSets: { ...st.addedSets, [c.carId]: (st.addedSets[c.carId] || []).concat([c.set]) },
        }));
      },
      clashReplace: () => {
        const c = this.state.seasonClash;
        if (!c) return;
        const [ecar, eidx] = c.existingKey.split('::');
        this.setState((st) => ({
          seasonClash: null, tireForm: null, tireSelect: null,
          removedSets: { ...st.removedSets, [ecar]: (st.removedSets[ecar] || []).concat([Number(eidx)]) },
          addedSets: { ...st.addedSets, [c.carId]: (st.addedSets[c.carId] || []).concat([c.set]) },
        }));
      },
      onNoteKey: (e) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        const el = e.currentTarget;
        const pos = el.selectionStart;
        const val = String(el.value || '');
        const NL = String.fromCharCode(10);
        this.setState((st) => ({ tireForm: { ...st.tireForm, note: val.slice(0, pos) + NL + val.slice(pos) } }));
      },
      onTireField: (e) => {
        const key = e.currentTarget.dataset.field;
        const val = key === 'location' ? String(e.target.value || '').slice(0, 40) : e.target.value;
        this.setState((st) => ({ tireForm: { ...st.tireForm, [key]: val } }));
      },
      onTireToggle: (e) => {
        const key = e.currentTarget.dataset.field;
        this.setState((st) => ({ tireForm: { ...st.tireForm, [key]: !st.tireForm[key] } }));
      },
      onTireBlockField: (e) => {
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({ tireForm: { ...st.tireForm, block: { ...st.tireForm.block, [key]: val } } }));
      },
      onTireWheelField: (e) => {
        const id = e.currentTarget.dataset.wheelId;
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({
          tireForm: { ...st.tireForm, wheels: st.tireForm.wheels.map((w) => (w.id === id ? { ...w, [key]: val } : w)) },
        }));
      },
      toggleTirePanel: (e) => {
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => {
          const f = st.tireForm;
          if (!f) return {};
          if (!key || key === f.editKey || !f.panels) return { tireForm: { ...f, collapsed: !f.collapsed } };
          const panels = f.panels.map((p) => (p.key === f.editKey
            ? { ...p, season: f.season, date: f.date, wheels: f.wheels, note: f.note, files: f.files, emailConfirm: f.emailConfirm }
            : p));
          const next = panels.find((p) => p.key === key);
          return { tireSelect: null, tireDateOpen: false, tireForm: { ...f, panels, editKey: key, collapsed: false, ...next } };
        });
      },
      toggleDatePicker: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ tireDateOpen: !st.tireDateOpen, tireSelect: null }));
      },
      stepMonth: (e) => {
        e.stopPropagation();
        const step = Number(e.currentTarget.dataset.step);
        this.setState((st) => {
          const f = st.tireForm;
          const [y, m] = f.date.split('-').map(Number);
          const base = f.calMonth || { y, m: m - 1 };
          const d = new Date(base.y, base.m + step, 1);
          return { tireForm: { ...f, calMonth: { y: d.getFullYear(), m: d.getMonth() } } };
        });
      },
      pickDate: (e) => {
        e.stopPropagation();
        const v = e.currentTarget.dataset.date;
        if (!v) return;
        this.setState((st) => ({ tireDateOpen: false, tireForm: { ...st.tireForm, date: v } }));
      },
      toggleTireSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ tireSelect: st.tireSelect === key ? null : key }));
      },
      pickTireSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        const val = e.currentTarget.dataset.value;
        this.setState((st) => {
          const f = st.tireForm;
          if (key === 'season') return { tireSelect: null, tireForm: { ...f, season: val } };
          if (key === 'rim') return { tireSelect: null, tireForm: { ...f, block: { ...f.block, rim: val } } };
          if (key === 'maker') return { tireSelect: null, tireForm: { ...f, block: { ...f.block, maker: val } } };
          const [kind, id] = key.split('::');
          const field = kind === 'wmaker' ? 'maker' : 'rim';
          return { tireSelect: null, tireForm: { ...f, wheels: f.wheels.map((w) => (w.id === id ? { ...w, [field]: val } : w)) } };
        });
      },
      addTireWheel: () => this.setState((st) => ({
        tireForm: { ...st.tireForm, wheels: st.tireForm.wheels.concat([{ id: 'w' + Date.now(), rim: '', maker: '', size: '', tread: '', qty: '1' }]) },
      })),
      copyTireWheel: () => this.setState((st) => {
        const ws = st.tireForm.wheels;
        const last = ws[ws.length - 1];
        return { tireForm: { ...st.tireForm, wheels: ws.concat([{ ...last, id: 'w' + Date.now() }]) } };
      }),
      removeTireWheel: (e) => {
        const id = e.currentTarget.dataset.wheelId;
        this.setState((st) => ({ tireForm: { ...st.tireForm, wheels: st.tireForm.wheels.filter((w) => w.id !== id) } }));
      },
      addTireFile: () => this.setState((st) => ({ tireForm: { ...st.tireForm, files: st.tireForm.files.concat(['photo']) } })),
      removeTireFile: (e) => {
        const idx = Number(String(e.currentTarget.dataset.fileKey).slice(1));
        this.setState((st) => ({ tireForm: { ...st.tireForm, files: st.tireForm.files.filter((x, i) => i !== idx) } }));
      },
      toggleStatusMenu: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => ({ statusMenu: st.statusMenu === key ? null : key, openTireMenu: null }));
      },
      pickStatus: (e) => {
        e.stopPropagation();
        const d = e.currentTarget.dataset;
        this.setState((st) => ({ statusMenu: null, setStatus: { ...st.setStatus, [d.setKey]: d.status } }));
      },
      toggleTireMenu: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.setKey;
        this.setState((st) => ({ openTireMenu: st.openTireMenu === key ? null : key }));
      },
      showTireTip: (e) => this.setState({ tireTip: e.currentTarget.dataset.tireId }),
      hideTireTip: () => this.setState({ tireTip: null }),
      rangeLabel: from + '–' + to + ' z ' + filtered.length,
      page,
      totalPages,
      prevOpacity: page <= 1 ? 0.4 : 1,
      nextOpacity: page >= totalPages ? 0.4 : 1,
      prevPage: () => this.setState((st) => ({ page: Math.max(1, st.page - 1) })),
      nextPage: () => this.setState((st) => ({ page: Math.min(totalPages, st.page + 1) })),
      openClient: (e) => this.setState({ screen: 'client', clientId: e.currentTarget.dataset.clientId, carIdx: 0 }),
      // z raportu wchodzimy na kartę klienta, na to auto, z rozwiniętym tym kompletem
      openReportRow: (e) => {
        const d = e.currentTarget.dataset;
        this.setState({
          screen: 'client',
          clientId: d.clientId,
          carIdx: Number(d.carIdx) || 0,
          openTireSet: d.setKey,
          openTireMenu: null,
          statusMenu: null,
        });
      },
      selectCar: (e) => this.setState({ carIdx: Number(e.currentTarget.dataset.carIndex) }),
      openEventFromVisit: (e) => {
        const id = e.currentTarget.dataset.eventId;
        if (this.state.events.some((ev) => ev.id === id)) this.setState({ eventId: id });
      },

      detail,
      edit: this.editVals() || {},
      isEditOpen: !!s.editMode,
      canSubmit: (() => {
        const f = (s.editForm && s.editForm.invoice) || {};
        return !f.on || this.nipComplete(f.nip);
      })(),
      submitOpacity: (() => {
        const f = (s.editForm && s.editForm.invoice) || {};
        return (!f.on || this.nipComplete(f.nip)) ? '1' : '0.5';
      })(),
      submitCursor: (() => {
        const f = (s.editForm && s.editForm.invoice) || {};
        return (!f.on || this.nipComplete(f.nip)) ? 'pointer' : 'not-allowed';
      })(),
      submitEvents: (() => {
        const f = (s.editForm && s.editForm.invoice) || {};
        return (!f.on || this.nipComplete(f.nip)) ? 'auto' : 'none';
      })(),
      openEditClient: () => this.openEdit('edit-client'),
      openAddVehicle: () => this.openEdit('add-vehicle'),
      openEditVehicle: () => this.openEdit('edit-vehicle'),
      closeEdit: () => this.setState({ editMode: null, editForm: null }),
      submitEdit: () => this.setState((st) => {
        const c = CLIENTS.find((x) => x.id === st.clientId) || CLIENTS[0];
        const next = Object.assign({}, st.clientGroups);
        const inv = Object.assign({}, st.clientInvoice);
        if (st.editForm && st.editMode === 'edit-client') {
          if (st.editForm.priceGroup) next[c.id] = st.editForm.priceGroup;
          else delete next[c.id];
          const f = st.editForm.invoice || {};
          if (f.on && this.nipComplete(f.nip)) inv[c.id] = Object.assign({}, f, { expanded: false });
          else delete inv[c.id];
        }
        return { editMode: null, editForm: null, clientGroups: next, clientInvoice: inv, openSelect: null };
      }),
      onEditField: (e) => {
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({ editForm: { ...st.editForm, [key]: val } }));
      },
      onEditToggle: (e) => {
        const key = e.currentTarget.dataset.field;
        this.setState((st) => ({ editForm: { ...st.editForm, [key]: !st.editForm[key] } }));
      },
      newGroupFromClient: (e) => {
        e.stopPropagation();
        this.setState({
          openSelect: null,
          screen: 'groupForm',
          groupDraft: { name: '', pct: '35', mode: 'pct', isDefault: false, editing: null },
          groupReturn: { clientId: s.clientId, editMode: s.editMode, editForm: s.editForm },
        });
      },
      onNipBlur: () => this.setState((st) => {
        const inv = (st.editForm || {}).invoice || {};
        return { editForm: Object.assign({}, st.editForm, { invoice: Object.assign({}, inv, { nipBlurred: true }) }) };
      }),
      toggleGroupSelect: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ openSelect: st.openSelect === 'client-group' ? null : 'client-group' }));
      },
      toggleVisitGroupSelect: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ openSelect: st.openSelect === 'visit-client-group' ? null : 'visit-client-group' }));
      },
      pickVisitClientGroup: (e) => {
        e.stopPropagation();
        const val = e.currentTarget.dataset.value;
        this.setState((st) => ({ openSelect: null, visitClientForm: { ...st.visitClientForm, priceGroup: val } }));
      },
      pickClientGroup: (e) => {
        e.stopPropagation();
        const val = e.currentTarget.dataset.value;
        this.setState((st) => ({
          openSelect: null,
          editForm: { ...st.editForm, priceGroup: st.editForm.priceGroup === val ? '' : val },
        }));
      },
      toggleSelect: (e) => {
        e.stopPropagation();
        const key = e.currentTarget.dataset.selectId;
        this.setState((st) => ({ openSelect: st.openSelect === key ? null : key }));
      },
      pickSelect: (e) => {
        e.stopPropagation();
        const [id, field] = e.currentTarget.dataset.selectId.split('::');
        const val = e.currentTarget.dataset.value;
        this.setState((st) => ({
          openSelect: null,
          editForm: {
            ...st.editForm,
            cars: st.editForm.cars.map((c) => (c.id === id
              ? { ...c, [field]: val, model: field === 'brand' && val !== c.brand ? '' : c.model }
              : c)),
          },
        }));
      },
      onEditCarField: (e) => {
        const id = e.currentTarget.dataset.carId;
        const key = e.currentTarget.dataset.field;
        const val = e.target.value;
        this.setState((st) => ({
          editForm: { ...st.editForm, cars: st.editForm.cars.map((c) => (c.id === id ? { ...c, [key]: val } : c)) },
        }));
      },
      toggleEditCar: (e) => {
        const id = e.currentTarget.dataset.carId;
        this.setState((st) => ({
          editForm: { ...st.editForm, cars: st.editForm.cars.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)) },
        }));
      },
      selectEditCar: (e) => {
        e.stopPropagation();
        this.setState((st) => ({ editForm: { ...st.editForm, selectedCarId: e.currentTarget.dataset.carId } }));
      },
      removeEditCar: (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.carId;
        this.setState((st) => {
          const cars = st.editForm.cars.filter((c) => c.id !== id);
          return { editForm: { ...st.editForm, cars, selectedCarId: st.editForm.selectedCarId === id ? (cars[0] && cars[0].id) || null : st.editForm.selectedCarId } };
        });
      },
      addEditCar: () => {
        this.setState((st) => {
          const fresh = { id: 'new-' + Date.now(), brand: '', model: '', year: '', engine: '', plate: '', vin: '', isNew: true, expanded: true };
          const collapsed = st.editForm.cars.map((c) => ({ ...c, expanded: false }));
          return { editForm: { ...st.editForm, cars: [fresh].concat(collapsed), selectedCarId: fresh.id } };
        });
      },
      attachmentsOn: false,   // załączniki wyłączone na czas testów
      evd: evd || {},
      closeEvent: () => this.setState({ eventId: null }, () => this.scrollToDayStart()),
      assignedPeople: this.visitPeopleIds().map((id) => PEOPLE.find((p) => p.id === id)).filter(Boolean),
      peopleEmpty: this.visitPeopleIds().length === 0,
      assignFilled: this.visitPeopleIds().length > 0,
      assignMenuOpen: s.assignMenuOpen,
      assignChevronRotate: s.assignMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      assignOptions: PEOPLE.map((p) => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        assigned: this.visitPeopleIds().includes(p.id),
        nameWeight: this.visitPeopleIds().includes(p.id) ? 500 : 400,
      })),
      toggleAssignMenu: () => this.setState({ assignMenuOpen: !this.state.assignMenuOpen }),
      togglePerson: (e) => {
        const id = e.currentTarget.dataset.personId;
        const vid = this.state.eventId;
        const person = (PEOPLE.filter((p) => p.id === id)[0] || {}).name || '';
        const ev = EVENTS.filter((x) => x.id === vid)[0] || {};
        this.setState((st) => {
          const cur = (st.assignedByVisit || {})[vid] || [];
          const adding = !cur.includes(id);
          const next = adding ? cur.concat([id]) : cur.filter((x) => x !== id);
          const q = (st.quotes || {})[vid] || null;
          const base = (q && q.state) || {};
          const rows = Array.isArray(base.robociznas) ? base.robociznas.slice() : [];
          let out;
          if (adding) {
            // pierwsza osoba przejmuje nazwę usługi z wizyty, kolejne dostają sam wiersz
            out = rows.concat([{
              name: rows.length === 0 ? (ev.reason || '') : '',
              person: person, qty: '1', czas: '0', cena: '0,00', rabat: '', vat: '23', unit: 'Godzina',
            }]);
          } else {
            // zdejmujemy tylko wiersz, którego nikt nie wypełnił — z kwotą zostaje
            let dropped = false;
            out = rows.filter((r) => {
              if (dropped || (r.person || r.osoba) !== person || this.qnum(r.cena) > 0) return true;
              dropped = true;
              return false;
            });
          }
          return {
            assignedByVisit: Object.assign({}, st.assignedByVisit, { [vid]: next }),
            quotes: Object.assign({}, st.quotes, {
              [vid]: { state: Object.assign({ towars: [] }, base, { robociznas: out }), items: (q && q.items) || [] },
            }),
          };
        });
      },
      clientCardOpen: s.clientCardOpen,
      clientCardArrowIcon: s.clientCardOpen ? 'assets/icons/i-arrow-up.svg' : 'assets/icons/i-arrow-down.svg',
      toggleClientCard: () => this.setState({ clientCardOpen: !this.state.clientCardOpen }),
    };
  }
}