'use strict';

// ─── SIE Generator (merged) ───────────────────────────────────────────────────
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

window.SIEGenerator = { buildSIEFile };

// ─── Release Notes ────────────────────────────────────────────────────────────
const LABELS_RN = {
  sv: { title: "Nyheter", ok: "OK", noNotes: "Inga versionsnoteringar tillgängliga." },
  en: { title: "What's new", ok: "OK", noNotes: "No release notes available." },
};

function renderMarkdown(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hup])/gm, '')
    .trim()
    .replace(/^(.+)$/, '<p>$1</p>');
}

function openReleaseNotes(version, notes) {
  const L = LABELS_RN[currentLang];
  document.getElementById('rn-title').textContent   = L.title;
  document.getElementById('rn-version').textContent = version || '';
  document.getElementById('rn-version').style.display = version ? '' : 'none';
  document.getElementById('rn-body').innerHTML = notes
    ? renderMarkdown(notes)
    : `<p style="color:var(--text-muted)">${L.noNotes}</p>`;
  document.getElementById('rn-ok').textContent = L.ok;
  document.getElementById('rn-overlay').classList.add('visible');
}

function closeReleaseNotes() {
  document.getElementById('rn-overlay').classList.remove('visible');
}

document.getElementById('rn-close').addEventListener('click', closeReleaseNotes);
document.getElementById('rn-ok').addEventListener('click', closeReleaseNotes);
document.getElementById('rn-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('rn-overlay')) closeReleaseNotes();
});

// "What's new" header button — always opens latest notes
let _cachedRelease = null;
document.getElementById('whats-new-btn').addEventListener('click', async () => {
  if (!_cachedRelease) {
    _cachedRelease = await window.electronAPI.getReleaseNotes().catch(() => ({ version: '', notes: '' }));
  }
  openReleaseNotes(_cachedRelease.version, _cachedRelease.notes);
});

// On startup: show release notes once per version
(async () => {
  try {
    const appVersion = await window.electronAPI.getAppVersion();
    const seenKey    = `rn-seen-${appVersion}`;
    if (localStorage.getItem(seenKey)) return;

    const release = await window.electronAPI.getReleaseNotes();
    _cachedRelease = release;

    if (release && release.notes) {
      localStorage.setItem(seenKey, '1');
      document.getElementById('whats-new-btn').classList.add('has-update');
      openReleaseNotes(release.version, release.notes);
    }
  } catch {
    // silently ignore — app works fine without release notes
  }
})();


const LABELS = {
  sv: {
    subtitle: 'Generera testfiler för SIE\u00a01 och SIE\u00a04',
    settings: 'Inställningar',
    sieType: 'SIE-typ',
    sie1: 'SIE\u00a01 \u2013 Saldon',
    sie4: 'SIE\u00a04 \u2013 Transaktioner',
    companyType: 'Företagsform',
    companyName: 'Företagsnamn',
    leaveEmpty: '(lämna tomt för slumpmässigt)',
    orgNumber: 'Organisationsnummer',
    prevYear: 'Föregående räkenskapsår',
    currYear: 'Innevarande räkenskapsår',
    accountPlan: 'Kontoplan',
    numAccounts: 'Antal konton (5–50)',
    numVouchers: 'Antal verifikationer (1–2000)',
    seedHint: '(valfritt, för reproducerbar utdata)',
    generating: 'Genererar…',
    generateBtn: 'Generera förhandsgranskning',
    downloadBtn: 'Ladda ned .se (CP437)',
    lines: (n) => `${n} rader`,
    emptyTitle: 'Ingen förhandsgranskning',
    emptyDesc: 'Konfigurera inställningarna och klicka på "Generera" för att se SIE-filens innehåll.',
    companyTypes: {
      AB: 'Aktiebolag (AB)', E: 'Enskild firma', EK: 'Ekonomisk förening',
      BRF: 'Bostadsrättsförening', HB: 'Handelsbolag (HB)', KB: 'Kommanditbolag (KB)',
    },
  },
  en: {
    subtitle: 'Generate test files for SIE\u00a01 and SIE\u00a04',
    settings: 'Settings',
    sieType: 'SIE type',
    sie1: 'SIE\u00a01 \u2013 Balances',
    sie4: 'SIE\u00a04 \u2013 Transactions',
    companyType: 'Company type',
    companyName: 'Company name',
    leaveEmpty: '(leave empty for random)',
    orgNumber: 'Organization number',
    prevYear: 'Previous fiscal year',
    currYear: 'Current fiscal year',
    accountPlan: 'Account plan',
    numAccounts: 'Number of accounts (5–50)',
    numVouchers: 'Number of vouchers (1–2000)',
    seedHint: '(optional, for reproducible output)',
    generating: 'Generating…',
    generateBtn: 'Generate preview',
    downloadBtn: 'Download .se (CP437)',
    lines: (n) => `${n} lines`,
    emptyTitle: 'No preview',
    emptyDesc: 'Configure the settings and click "Generate" to see the SIE file content.',
    companyTypes: {
      AB: 'Limited company (AB)', E: 'Sole trader', EK: 'Economic association',
      BRF: 'Housing cooperative', HB: 'General partnership (HB)', KB: 'Limited partnership (KB)',
    },
  },
};

// ─── State ────────────────────────────────────────────────────────────────────
let currentLang = 'sv';
let currentResult = null;
let isLoading = false;

// ─── Default dates ────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

const thisYear = new Date().getFullYear();
document.getElementById('currYearStart').value  = isoDate(thisYear,     1,  1);
document.getElementById('currYearEnd').value    = isoDate(thisYear,    12, 31);
document.getElementById('prevYearStart').value  = isoDate(thisYear - 1, 1,  1);
document.getElementById('prevYearEnd').value    = isoDate(thisYear - 1, 12, 31);

// ─── SIE-type toggle: show/hide vouchers field ────────────────────────────────
document.querySelectorAll('input[name="sieType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isSie4 = document.querySelector('input[name="sieType"]:checked').value === '4';
    document.getElementById('vouchers-field').style.display = isSie4 ? '' : 'none';
  });
});

// ─── Button event listeners ───────────────────────────────────────────────────
document.getElementById('btn-sv').addEventListener('click', () => setLang('sv'));
document.getElementById('btn-en').addEventListener('click', () => setLang('en'));
document.getElementById('theme-btn').addEventListener('click', () => toggleTheme());

// ─── Number stepper ───────────────────────────────────────────────────────────
window.step = function step(id, delta, min, max) {
  const el = document.getElementById(id);
  const val = Math.min(max, Math.max(min, (parseInt(el.value, 10) || 0) + delta));
  el.value = val;
};

// ─── Theme toggle ─────────────────────────────────────────────────────────────
window.toggleTheme = function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  document.getElementById('icon-dark').style.display  = isDark ? 'none'  : '';
  document.getElementById('icon-light').style.display = isDark ? ''      : 'none';
};

// ─── Language ─────────────────────────────────────────────────────────────────
window.setLang = function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  document.getElementById('btn-sv').classList.toggle('active', lang === 'sv');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  applyLabels();
};

function applyLabels() {
  const L = LABELS[currentLang];
  document.documentElement.lang = currentLang;
  document.getElementById('hdr-subtitle').textContent     = L.subtitle;
  document.getElementById('lbl-settings').textContent     = L.settings;
  document.getElementById('lbl-sie-type').textContent     = L.sieType;
  document.getElementById('lbl-sie1').textContent          = L.sie1;
  document.getElementById('lbl-sie4').textContent          = L.sie4;
  document.getElementById('lbl-company-type').textContent  = L.companyType;
  document.getElementById('lbl-company-name').textContent  = L.companyName;
  document.getElementById('lbl-leave-empty').textContent   = L.leaveEmpty;
  document.getElementById('lbl-org-number').textContent    = L.orgNumber;
  document.getElementById('lbl-prev-year').textContent     = L.prevYear;
  document.getElementById('lbl-curr-year').textContent     = L.currYear;
  document.getElementById('lbl-account-plan').textContent  = L.accountPlan;
  document.getElementById('lbl-num-accounts').textContent  = L.numAccounts;
  document.getElementById('lbl-num-vouchers').textContent  = L.numVouchers;
  document.getElementById('lbl-seed-hint').textContent     = L.seedHint;
  const genTxt = document.getElementById('btn-generate-text');
  if (genTxt) genTxt.textContent = isLoading ? L.generating : L.generateBtn;
  document.getElementById('btn-download-text').textContent = L.downloadBtn;
  document.getElementById('empty-title').textContent       = L.emptyTitle;
  document.getElementById('empty-desc').textContent        = L.emptyDesc;
  // Company type options
  const sel = document.getElementById('companyType');
  const ct = L.companyTypes;
  document.getElementById('opt-AB').textContent  = ct.AB;
  document.getElementById('opt-E').textContent   = ct.E;
  document.getElementById('opt-EK').textContent  = ct.EK;
  document.getElementById('opt-BRF').textContent = ct.BRF;
  document.getElementById('opt-HB').textContent  = ct.HB;
  document.getElementById('opt-KB').textContent  = ct.KB;
  // Update line count if result is showing
  if (currentResult) {
    const lineCount = (currentResult.content.match(/\r\n|\n/g) || []).length;
    document.getElementById('result-lines').textContent = L.lines(lineCount);
  }
}

// ─── SIE syntax highlighting ──────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const HEADER_KWS = new Set(['#FLAGGA','#FORMAT','#SIETYP','#PROGRAM','#GEN','#FNAMN',
  '#ORGNR','#ADRESS','#FTYP','#RAR','#TAXAR','#VALUTA','#KPTYP']);

function highlightSIELine(raw) {
  const line = raw.trimEnd();
  if (line === '{' || line === '}') return `<span class="sie-brace">${escHtml(line)}</span>`;
  if (!line.startsWith('#')) return escHtml(line);

  const sp = line.indexOf(' ');
  const kw = sp === -1 ? line : line.slice(0, sp);
  const rest = sp === -1 ? '' : line.slice(sp);

  let kwClass;
  if (HEADER_KWS.has(kw))                         kwClass = 'sie-kw-header';
  else if (kw === '#KONTO' || kw === '#KTYP')      kwClass = 'sie-kw-account';
  else if (kw === '#IB' || kw === '#UB' || kw === '#RES') kwClass = 'sie-kw-balance';
  else if (kw === '#VER')                           kwClass = 'sie-kw-ver';
  else if (kw === '#TRANS')                         kwClass = 'sie-kw-trans';
  else                                              kwClass = 'sie-kw-header';

  const coloredRest = rest
    .replace(/"([^"]*)"/g, (_, m) => `<span class="sie-string">"${escHtml(m)}"</span>`)
    .replace(/(?<= )(-?\d+\.\d+)(?= |$)/g, (m) => `<span class="sie-number-val">${m}</span>`);

  return `<span class="${kwClass}">${escHtml(kw)}</span>${coloredRest}`;
}

function renderSIECode(content) {
  return content.split(/\r?\n/).map(highlightSIELine).join('\n');
}

// ─── Build request from form ──────────────────────────────────────────────────
function buildRequest() {
  const sieType = parseInt(document.querySelector('input[name="sieType"]:checked').value, 10);
  return {
    sieType,
    companyType: document.getElementById('companyType').value,
    companyName: document.getElementById('companyName').value,
    orgNumber:   document.getElementById('orgNumber').value,
    fiscalYearStart:         (document.getElementById('currYearStart').value || '').replace(/-/g, ''),
    fiscalYearEnd:           (document.getElementById('currYearEnd').value   || '').replace(/-/g, ''),
    previousFiscalYearStart: (document.getElementById('prevYearStart').value || '').replace(/-/g, ''),
    previousFiscalYearEnd:   (document.getElementById('prevYearEnd').value   || '').replace(/-/g, ''),
    accountPlanType:  document.getElementById('accountPlan').value,
    numberOfAccounts: parseInt(document.getElementById('numAccounts').value, 10) || 20,
    numberOfVouchers: parseInt(document.getElementById('numVouchers').value, 10) || 30,
    seed: document.getElementById('seed').value,
  };
}

// ─── Generate ─────────────────────────────────────────────────────────────────
window.generate = function generate() {
  setError(null);
  setLoading(true);

  // Use setTimeout so the UI can repaint before the (synchronous) generation runs
  setTimeout(() => {
    try {
      const req = buildRequest();
      const result = window.SIEGenerator.buildSIEFile(req);
      currentResult = result;
      showResult(result);
    } catch (e) {
      setError(e.message || 'Ett fel uppstod vid generering.');
    } finally {
      setLoading(false);
    }
  }, 30);
};

// ─── Download ─────────────────────────────────────────────────────────────────
window.downloadFile = async function downloadFile() {
  if (!currentResult) return;
  document.getElementById('btn-download').disabled = true;
  try {
    const res = await window.electronAPI.saveFile({
      filename: currentResult.filename,
      content:  currentResult.content,
    });
    if (res && res.error) setError(res.error);
  } catch (e) {
    setError(e.message || 'Nedladdning misslyckades.');
  } finally {
    document.getElementById('btn-download').disabled = false;
  }
};

// ─── UI helpers ───────────────────────────────────────────────────────────────
function setLoading(v) {
  isLoading = v;
  const btn = document.getElementById('btn-generate');
  const txt = document.getElementById('btn-generate-text');
  const L = LABELS[currentLang];
  btn.disabled = v;

  if (v) {
    txt.textContent = L.generating;
    btn.innerHTML = `<div class="spinner"></div><span>${L.generating}</span>`;
  } else {
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M7.5 1v2M7.5 12v2M1 7.5h2M12 7.5h2M3.22 3.22l1.41 1.41M10.37 10.37l1.41 1.41M3.22 11.78l1.41-1.41M10.37 4.63l1.41-1.41" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="7.5" cy="7.5" r="2.5" fill="currentColor"/>
      </svg>
      <span id="btn-generate-text">${L.generateBtn}</span>`;
  }
}

function setError(msg) {
  const el = document.getElementById('error-box');
  el.textContent = msg || '';
  el.classList.toggle('visible', !!msg);
}

function showResult(result) {
  const L = LABELS[currentLang];
  document.getElementById('empty-state').style.display  = 'none';
  const rv = document.getElementById('result-view');
  rv.classList.add('visible');
  document.getElementById('result-filename').textContent = result.filename;
  document.getElementById('sie-code').innerHTML = renderSIECode(result.content);
  const lineCount = (result.content.match(/\r\n|\n/g) || []).length;
  document.getElementById('result-lines').textContent = L.lines(lineCount);
}

