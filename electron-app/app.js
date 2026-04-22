'use strict';

// ─── i18n ─────────────────────────────────────────────────────────────────────
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
