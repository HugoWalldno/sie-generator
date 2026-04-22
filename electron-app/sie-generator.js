'use strict';

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function createRng(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(min, max) { return min + Math.floor(this.next() * (max - min)); },
    nextDouble() { return this.next(); },
  };
}

// ─── Account types ────────────────────────────────────────────────────────────
const T = { Asset: 'Asset', Liability: 'Liability', Revenue: 'Revenue', Cost: 'Cost', Other: 'Other' };

function a(number, name, type) { return { number, name, type }; }

// ─── Common account pools ─────────────────────────────────────────────────────
const CommonAssets = [
  a('1510', 'Kundfordringar', T.Asset),
  a('1630', 'Avräkning för skatter och avgifter (skattekonto)', T.Asset),
  a('1650', 'Momsfordran', T.Asset),
  a('1710', 'Förutbetalda hyreskostnader', T.Asset),
  a('1730', 'Förutbetalda försäkringspremier', T.Asset),
  a('1790', 'Övriga förutbetalda kostnader och upplupna intäkter', T.Asset),
  a('1910', 'Kassa', T.Asset),
  a('1930', 'Företagskonto/checkkonto', T.Asset),
];

const CommonLiabilities = [
  a('2440', 'Leverantörsskulder', T.Liability),
  a('2510', 'Skatteskulder', T.Liability),
  a('2611', 'Utgående moms 25%', T.Liability),
  a('2640', 'Ingående moms', T.Asset),
  a('2710', 'Personalens källskatt', T.Liability),
  a('2730', 'Lagstadgade sociala avgifter', T.Liability),
  a('2920', 'Upplupna semesterlöner', T.Liability),
  a('2940', 'Upplupna lagstadgade sociala avgifter', T.Liability),
  a('2960', 'Upplupna räntekostnader', T.Liability),
];

const CommonRevenue = [
  a('3001', 'Försäljning av tjänster 25% moms', T.Revenue),
  a('3051', 'Försäljning av varor 25% moms', T.Revenue),
  a('3740', 'Öres- och kronutjämning', T.Revenue),
  a('3960', 'Valutakursvinster', T.Revenue),
];

const CommonCosts = [
  a('4010', 'Inköp av material och varor', T.Cost),
  a('5010', 'Lokalhyra', T.Cost),
  a('5020', 'El för belysning', T.Cost),
  a('5410', 'Förbrukningsinventarier', T.Cost),
  a('6110', 'Kontorsmaterial', T.Cost),
  a('6212', 'Mobiltelefon', T.Cost),
  a('6230', 'Datakommunikation', T.Cost),
  a('6250', 'Postbefordran', T.Cost),
  a('6310', 'Företagsförsäkringar', T.Cost),
  a('6530', 'Redovisningstjänster', T.Cost),
  a('6570', 'Bankkostnader', T.Cost),
  a('7010', 'Löner till tjänstemän', T.Cost),
  a('7210', 'Arbetsgivaravgifter', T.Cost),
  a('7290', 'Förändring av semesterlöneskuld', T.Cost),
  a('7510', 'Arbetsgivaravgifter 31,42%', T.Cost),
  a('7832', 'Avskrivningar på inventarier och verktyg', T.Cost),
  a('8410', 'Räntekostnader', T.Cost),
];

// ─── Equity pools per company type ───────────────────────────────────────────
const EquityAB = [
  a('2081', 'Aktiekapital', T.Liability),
  a('2086', 'Reservfond', T.Liability),
  a('2091', 'Balanserad vinst eller förlust', T.Liability),
  a('2098', 'Vinst eller förlust från föregående år', T.Liability),
  a('2099', 'Årets resultat', T.Liability),
  a('2122', 'Periodiseringsfond 2022', T.Liability),
  a('2123', 'Periodiseringsfond 2023', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('2650', 'Redovisningskonto för moms', T.Liability),
  a('8310', 'Ränteintäkter', T.Revenue),
  a('8999', 'Årets skattepliktiga resultat', T.Other),
];

const EquityE = [
  a('2010', 'Eget kapital, delägare 1', T.Liability),
  a('2013', 'Övriga egna uttag', T.Liability),
  a('2017', 'Egna insättningar', T.Liability),
  a('2019', 'Årets resultat, delägare 1', T.Liability),
  a('2050', 'Avsättning till expansionsfond', T.Liability),
  a('2080', 'Periodiseringsfonder', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('8310', 'Ränteintäkter', T.Revenue),
  a('8999', 'Årets skattepliktiga resultat', T.Other),
];

const EquityEK = [
  a('2081', 'Inbetalda insatser', T.Liability),
  a('2083', 'Medlemsinsatser', T.Liability),
  a('2084', 'Förlagsinsatser', T.Liability),
  a('2091', 'Balanserad vinst eller förlust', T.Liability),
  a('2099', 'Årets resultat', T.Liability),
  a('2122', 'Periodiseringsfond 2022', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('8310', 'Ränteintäkter', T.Revenue),
];

const EquityBRF = [
  a('2081', 'Inbetalda insatser/grundavgifter', T.Liability),
  a('2083', 'Upplåtelseavgifter', T.Liability),
  a('2091', 'Balanserad vinst eller förlust', T.Liability),
  a('2099', 'Årets resultat', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('1110', 'Byggnader', T.Asset),
  a('1119', 'Ackumulerade avskrivningar på byggnader', T.Asset),
  a('1130', 'Mark', T.Asset),
  a('3911', 'Hyresintäkter', T.Revenue),
  a('5170', 'Reparation och underhåll av fastighet', T.Cost),
  a('5191', 'Fastighetsskatt/fastighetsavgift', T.Cost),
  a('7820', 'Avskrivningar på byggnader', T.Cost),
  a('8310', 'Ränteintäkter', T.Revenue),
];

const EquityHB = [
  a('2010', 'Eget kapital, delägare 1', T.Liability),
  a('2013', 'Övriga egna uttag', T.Liability),
  a('2017', 'Egna insättningar', T.Liability),
  a('2019', 'Årets resultat, delägare 1', T.Liability),
  a('2020', 'Eget kapital, delägare 2', T.Liability),
  a('2023', 'Övriga egna uttag, delägare 2', T.Liability),
  a('2027', 'Egna insättningar, delägare 2', T.Liability),
  a('2029', 'Årets resultat, delägare 2', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('8310', 'Ränteintäkter', T.Revenue),
  a('8999', 'Årets skattepliktiga resultat', T.Other),
];

const EquityKB = [
  a('2010', 'Eget kapital, komplementär', T.Liability),
  a('2013', 'Övriga egna uttag, komplementär', T.Liability),
  a('2017', 'Egna insättningar, komplementär', T.Liability),
  a('2019', 'Årets resultat, komplementär', T.Liability),
  a('2020', 'Eget kapital, kommanditdelägare', T.Liability),
  a('2027', 'Insatt kapital, kommanditdelägare', T.Liability),
  a('2029', 'Årets resultat, kommanditdelägare', T.Liability),
  a('2350', 'Skulder till kreditinstitut, långfristiga', T.Liability),
  a('8310', 'Ränteintäkter', T.Revenue),
  a('8999', 'Årets skattepliktiga resultat', T.Other),
];

const EQUITY_MAP = { AB: EquityAB, E: EquityE, EK: EquityEK, BRF: EquityBRF, HB: EquityHB, KB: EquityKB };

function getAccountPool(companyType) {
  const equity = EQUITY_MAP[companyType] || EquityAB;
  const all = [...CommonAssets, ...CommonLiabilities, ...CommonRevenue, ...CommonCosts, ...equity];
  const seen = new Set();
  return all.filter(acc => { if (seen.has(acc.number)) return false; seen.add(acc.number); return true; });
}

// ─── Company data ─────────────────────────────────────────────────────────────
const CompanyNames = [
  'Nordisk Teknik', 'Svenska Lösningar', 'Bergström & Partners', 'Lindqvist Consulting',
  'Söderström Handel', 'Karlsson Bygg', 'Eriksson Data', 'Johansson Fastigheter',
  'Pettersson Redovisning', 'Andersson & Söner', 'Malmström Invest', 'Holmberg Service',
  'Strand Förvaltning', 'Eklund Industri', 'Lundgren Media', 'Nilsson Logistik',
  'Åberg Transport', 'Öberg Finans', 'Sjögren El', 'Hedlund Automation',
];

const CompanySuffixes = {
  AB: ['AB'], E: [''], EK: ['ekonomisk förening', 'kooperativ'],
  BRF: ['Bostadsrättsförening'], HB: ['HB', 'Handelsbolag'], KB: ['KB', 'Kommanditbolag'],
};

const VoucherDescriptions = [
  'Leverantörsfaktura', 'Kundfaktura', 'Löner', 'Hyresbetalning', 'Bankavgifter',
  'Programvarulicens', 'Kontorsmaterial', 'Representation', 'Reklamkampanj',
  'Konsulttjänst', 'Telefonräkning', 'El och värme', 'Försäkringspremie',
  'Momsdeklaration', 'Skatteinbetalning', 'Utlägg personal', 'Inventarieköp',
  'Räntebetalning', 'Dividend', 'Kapitalinsättning',
];

const ESSENTIAL_ACCOUNTS = {
  AB:  ['1930', '2081', '2099', '3001', '7010', '2440'],
  E:   ['1930', '2010', '2017', '3001', '7010', '2440'],
  EK:  ['1930', '2083', '2099', '3001', '7010', '2440'],
  BRF: ['1930', '2081', '2099', '3911', '5010', '2440'],
  HB:  ['1930', '2010', '2020', '3001', '7010', '2440'],
  KB:  ['1930', '2010', '2020', '3001', '7010', '2440'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function round2(n) { return Math.round(n * 100) / 100; }

function parseDate(s) {
  return new Date(parseInt(s.slice(0, 4), 10), parseInt(s.slice(4, 6), 10) - 1, parseInt(s.slice(6, 8), 10));
}

function formatDateStr(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function sieToken(v) {
  if (!v) return '""';
  const esc = v.replace(/"/g, '\\"');
  return esc.includes(' ') ? `"${esc}"` : esc;
}

function fmtAmt(n) { return n.toFixed(2); }

function mapKptyp(planType) {
  if (!planType) return 'EUBAS97';
  if (planType.toUpperCase().startsWith('BAS2')) return 'EUBAS97';
  return { BAS95: 'BAS95', BAS96: 'BAS96', EUBAS97: 'EUBAS97', NE2007: 'NE2007' }[planType.toUpperCase()] || 'EUBAS97';
}

function sanitizeFilename(name) { return name.replace(/[<>:"/\\|?*\s]/g, ''); }

// ─── Mock data generation ─────────────────────────────────────────────────────
function pickAccounts(rng, count, pool, companyType) {
  const essentialNums = new Set(ESSENTIAL_ACCOUNTS[companyType] || ESSENTIAL_ACCOUNTS.AB);
  const essential = pool.filter(acc => essentialNums.has(acc.number));
  const rest = pool.filter(acc => !essentialNums.has(acc.number));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [...essential, ...rest.slice(0, Math.max(0, count - essential.length))];
}

function generateBalances(rng, accounts) {
  const results = accounts.map(acc => {
    const m = { ...acc, openingBalance: 0, closingBalance: 0, result: 0 };
    switch (acc.type) {
      case T.Asset:
        m.openingBalance = round2(rng.nextDouble() * 500000);
        m.closingBalance = round2(rng.nextDouble() * 600000);
        break;
      case T.Liability:
        m.openingBalance = -round2(rng.nextDouble() * 400000);
        m.closingBalance = -round2(rng.nextDouble() * 450000);
        break;
      case T.Revenue:
        m.result = -round2(rng.nextDouble() * 1000000 + 100000);
        break;
      case T.Cost:
        m.result = round2(rng.nextDouble() * 500000 + 10000);
        break;
      default:
        m.result = round2(rng.nextDouble() * 10000 - 5000);
    }
    return m;
  });

  // ── Balance the balance sheet ─────────────────────────────────────────────
  // SIE requires: Sum(all #IB) = 0  and  Sum(all #UB) = 0.
  //
  // Strategy:
  //   resultAcc    – holds "årets resultat" (2099/2019/2029).
  //                  IB = 0 (result is reset at year start).
  //                  UB = Sum(all #RES) so the P&L flows into equity.
  //   balancingAcc – retained-earnings account (2091/2010/2081…).
  //                  Its IB/UB are adjusted to make the sheet balance.

  const liabilities = results.filter(a => a.type === T.Liability);
  if (liabilities.length < 2) return results; // too few accounts to balance

  const RESULT_NUMS    = ['2099', '2019', '2029', '2098'];
  const BALANCING_NUMS = ['2091', '2010', '2086', '2081', '2020', '2083'];

  const resultAcc = liabilities.find(a => RESULT_NUMS.includes(a.number))
    || liabilities[liabilities.length - 1];

  const balancingAcc = liabilities.find(a => a !== resultAcc && BALANCING_NUMS.includes(a.number))
    || liabilities.find(a => a !== resultAcc);

  if (!balancingAcc) return results;

  // Period result = sum of all P&L results (negative = profit, positive = loss in SIE convention)
  const periodResult = round2(results.reduce((s, a) => {
    if (a.type === T.Revenue || a.type === T.Cost || a.type === T.Other) return s + a.result;
    return s;
  }, 0));

  // årets resultat: IB = 0 (reset at year start), UB = 0 (result is shown via #RES, not duplicated in #UB)
  resultAcc.openingBalance = 0;
  resultAcc.closingBalance = 0;

  // Adjust balancingAcc.IB so Sum(all IB) = 0
  const ibOthers = results
    .filter(a => (a.type === T.Asset || a.type === T.Liability) && a !== balancingAcc)
    .reduce((s, a) => s + a.openingBalance, 0);
  balancingAcc.openingBalance = round2(-ibOthers);

  // Adjust balancingAcc.UB so Sum(all UB) + Sum(all RES) = 0
  // i.e. Sum(UB) = -periodResult, so the balance sheet + P&L nets to zero
  const ubOthers = results
    .filter(a => (a.type === T.Asset || a.type === T.Liability) && a !== balancingAcc)
    .reduce((s, a) => s + a.closingBalance, 0);
  balancingAcc.closingBalance = round2(-periodResult - ubOthers);

  return results;
}

function generateVouchers(rng, accounts, startDate, endDate, count) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const totalDays = Math.max(1, Math.round((end - start) / 86400000));
  const balAccs = accounts.filter(acc => acc.type === T.Asset || acc.type === T.Liability);
  const resAccs = accounts.filter(acc => acc.type === T.Revenue || acc.type === T.Cost);
  if (balAccs.length < 2) return [];

  const series = ['A', 'B', 'C'];
  const counters = { A: 1, B: 1, C: 1 };
  const vouchers = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(start.getTime() + rng.nextInt(0, totalDays) * 86400000);
    const desc = VoucherDescriptions[rng.nextInt(0, VoucherDescriptions.length)];
    const amount = round2(rng.nextDouble() * 50000 + 500);
    const ser = series[rng.nextInt(0, series.length)];
    const debit = balAccs[rng.nextInt(0, balAccs.length)];

    let credit;
    if (resAccs.length > 0 && rng.nextInt(0, 2) === 0) {
      credit = resAccs[rng.nextInt(0, resAccs.length)];
    } else {
      credit = balAccs[rng.nextInt(0, balAccs.length)];
      let tries = 0;
      while (credit.number === debit.number && balAccs.length > 1 && tries++ < 10)
        credit = balAccs[rng.nextInt(0, balAccs.length)];
    }

    vouchers.push({
      series: ser, number: counters[ser]++,
      date: formatDateStr(date), description: desc,
      transactions: [
        { accountNumber: debit.number, amount, description: desc },
        { accountNumber: credit.number, amount: -amount, description: desc },
      ],
    });
  }
  return vouchers;
}

// ─── Main export ──────────────────────────────────────────────────────────────
function buildSIEFile(request) {
  const rawSeed = request.seed !== null && request.seed !== undefined && request.seed !== '' ? parseInt(request.seed, 10) : null;
  const seed = (rawSeed !== null && !isNaN(rawSeed)) ? rawSeed : (Date.now() % 2147483647);
  const rng = createRng(seed);

  const companyType = request.companyType || 'AB';
  const pool = getAccountPool(companyType);

  const name = (request.companyName && request.companyName.trim())
    ? request.companyName.trim()
    : (() => {
        const base = CompanyNames[rng.nextInt(0, CompanyNames.length)];
        const suf = CompanySuffixes[companyType] || [''];
        const s = suf[rng.nextInt(0, suf.length)];
        return s ? `${base} ${s}` : base;
      })();

  const orgNumber = (request.orgNumber && request.orgNumber.trim())
    ? request.orgNumber.trim()
    : `${rng.nextInt(100000, 999999)}-${rng.nextInt(1000, 9999)}`;

  const thisYear = new Date().getFullYear();
  const fyStart = request.fiscalYearStart || `${thisYear - 1}0101`;
  const fyEnd   = request.fiscalYearEnd   || `${thisYear - 1}1231`;
  const pvStart = request.previousFiscalYearStart || `${thisYear - 2}0101`;
  const pvEnd   = request.previousFiscalYearEnd   || `${thisYear - 2}1231`;

  const count = Math.min(Math.max(request.numberOfAccounts || 20, 5), pool.length);
  const picked = pickAccounts(rng, count, pool, companyType);
  const accounts = generateBalances(rng, picked);

  const vouchers = request.sieType === 4
    ? generateVouchers(rng, accounts, fyStart, fyEnd, Math.min(Math.max(request.numberOfVouchers || 30, 1), 2000))
    : [];

  // Build SIE file content
  const lines = [];
  const now = new Date();
  const todayStr = formatDateStr(now);
  const taxYear = parseInt(fyEnd.slice(0, 4), 10) + 1;
  const kptyp = mapKptyp(request.accountPlanType);

  lines.push('#FLAGGA 0');
  lines.push('#FORMAT PC8');
  lines.push(`#SIETYP ${request.sieType}`);
  lines.push('#PROGRAM "SIE Generator" 1.0');
  lines.push(`#GEN ${todayStr}`);
  lines.push(`#FNAMN ${sieToken(name)}`);
  lines.push(`#ORGNR ${orgNumber}`);
  lines.push('#ADRESS "" "" "" ""');
  lines.push(`#FTYP ${companyType}`);
  lines.push(`#RAR 0 ${fyStart} ${fyEnd}`);
  lines.push(`#RAR -1 ${pvStart} ${pvEnd}`);
  lines.push(`#TAXAR ${taxYear}`);
  if (request.sieType === 4) lines.push('#VALUTA SEK');
  lines.push(`#KPTYP ${kptyp}`);

  const sorted = [...accounts].sort((x, y) => x.number.localeCompare(y.number));
  const ktypMap = { Asset: 'T', Liability: 'S', Revenue: 'I', Cost: 'K' };
  for (const acc of sorted) {
    lines.push(`#KONTO ${acc.number} ${sieToken(acc.name)}`);
    if (ktypMap[acc.type]) lines.push(`#KTYP ${acc.number} ${ktypMap[acc.type]}`);
  }

  const balAccs = sorted.filter(acc => acc.type === T.Asset || acc.type === T.Liability);
  for (const acc of balAccs) if (acc.openingBalance !== 0) lines.push(`#IB 0 ${acc.number} ${fmtAmt(acc.openingBalance)}`);
  for (const acc of balAccs) if (acc.closingBalance !== 0) lines.push(`#UB 0 ${acc.number} ${fmtAmt(acc.closingBalance)}`);

  const resAccs = sorted.filter(acc => acc.type === T.Revenue || acc.type === T.Cost || acc.type === T.Other);
  for (const acc of resAccs) if (acc.result !== 0) lines.push(`#RES 0 ${acc.number} ${fmtAmt(acc.result)}`);

  if (request.sieType === 4) {
    const sortedV = [...vouchers].sort((x, y) => x.series !== y.series ? x.series.localeCompare(y.series) : x.number - y.number);
    for (const v of sortedV) {
      lines.push(`#VER ${v.series} ${v.number} ${v.date} ${sieToken(v.description)}`);
      lines.push('{');
      for (const t of v.transactions) lines.push(`#TRANS ${t.accountNumber} {} ${fmtAmt(t.amount)}`);
      lines.push('}');
    }
  }

  const content = lines.join('\r\n') + '\r\n';
  const sieTypeLabel = request.sieType === 4 ? '4' : '1';
  const filename = `${sanitizeFilename(name)}_SIE${sieTypeLabel}_${fyStart.slice(0, 4)}.se`;

  return { content, filename };
}

if (typeof window !== 'undefined') {
  window.SIEGenerator = { buildSIEFile };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildSIEFile };
}
