import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SieService, SIEGenerationRequest, SIEGenerationResult } from './sie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly accountPlans = ['BAS2020', 'BAS2016', 'EUBAS97', 'BAS96'];

  lang = signal<'sv' | 'en'>('sv');

  private readonly translations = {
    sv: {
      subtitle: 'Generera testfiler för SIE\u00a01 och SIE\u00a04',
      settings: 'Inställningar',
      sieType: 'SIE-typ',
      sie1: 'SIE\u00a01 \u2013 Saldon',
      sie4: 'SIE\u00a04 \u2013 Transaktioner',
      companyType: 'Företagsform',
      companyName: 'Företagsnamn',
      leaveEmpty: 'lämna tomt för slumpmässigt',
      orgNumber: 'Organisationsnummer',
      prevFiscalYear: 'Föregående räkenskapsår',
      currFiscalYear: 'Innevarande räkenskapsår',
      accountPlan: 'Kontoplan',
      numAccounts: 'Antal konton (5–50)',
      numVouchers: 'Antal verifikationer (1–2000)',
      seedHint: 'valfritt, för reproducerbar utdata',
      generating: 'Genererar...',
      generatePreview: 'Generera förhandsgranskning',
      download: 'Ladda ned .se-fil (CP437)',
      companyTypeLabels: {
        AB: 'Aktiebolag (AB)',
        E: 'Enskild firma',
        EK: 'Ekonomisk förening',
        BRF: 'Bostadsrättsförening',
        HB: 'Handelsbolag (HB)',
        KB: 'Kommanditbolag (KB)',
      }
    },
    en: {
      subtitle: 'Generate test files for SIE\u00a01 and SIE\u00a04',
      settings: 'Settings',
      sieType: 'SIE type',
      sie1: 'SIE\u00a01 \u2013 Balances',
      sie4: 'SIE\u00a04 \u2013 Transactions',
      companyType: 'Company type',
      companyName: 'Company name',
      leaveEmpty: 'leave empty for random',
      orgNumber: 'Organization number',
      prevFiscalYear: 'Previous fiscal year',
      currFiscalYear: 'Current fiscal year',
      accountPlan: 'Account plan',
      numAccounts: 'Number of accounts (5–50)',
      numVouchers: 'Number of vouchers (1–2000)',
      seedHint: 'optional, for reproducible output',
      generating: 'Generating...',
      generatePreview: 'Generate preview',
      download: 'Download .se file (CP437)',
      companyTypeLabels: {
        AB: 'Limited company (AB)',
        E: 'Sole trader',
        EK: 'Economic association',
        BRF: 'Housing cooperative',
        HB: 'General partnership (HB)',
        KB: 'Limited partnership (KB)',
      }
    }
  };

  labels = computed(() => this.translations[this.lang()]);

  companyTypes = computed(() => {
    const ct = this.labels().companyTypeLabels;
    return [
      { value: 'AB',  label: ct.AB },
      { value: 'E',   label: ct.E },
      { value: 'EK',  label: ct.EK },
      { value: 'BRF', label: ct.BRF },
      { value: 'HB',  label: ct.HB },
      { value: 'KB',  label: ct.KB },
    ];
  });

  request: SIEGenerationRequest = {
    sieType: 4,
    companyType: 'AB',
    companyName: '',
    orgNumber: '',
    accountPlanType: 'BAS2020',
    numberOfAccounts: 20,
    numberOfVouchers: 30,
    seed: null,
  };

  private static toyyyyMMdd(date: string): string {
    return date.replace(/-/g, '');
  }

  private static defaultDate(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  readonly thisYear = new Date().getFullYear();

  currentYearStart  = App.defaultDate(this.thisYear,     1,  1);
  currentYearEnd    = App.defaultDate(this.thisYear,    12, 31);
  previousYearStart = App.defaultDate(this.thisYear - 1, 1,  1);
  previousYearEnd   = App.defaultDate(this.thisYear - 1, 12, 31);

  result = signal<SIEGenerationResult | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  isSie4 = computed(() => this.request.sieType === 4);

  constructor(private sieService: SieService) {}

  generate(): void {
    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    this.sieService.preview(this.buildRequest()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Ett fel uppstod vid anrop till API.');
        this.loading.set(false);
      }
    });
  }

  download(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sieService.download(this.buildRequest()).subscribe({
      next: (blob) => {
        const filename = this.result()?.filename ?? 'export.se';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Nedladdning misslyckades.');
        this.loading.set(false);
      }
    });
  }

  private buildRequest(): SIEGenerationRequest {
    return {
      ...this.request,
      companyName: this.request.companyName?.trim() || undefined,
      orgNumber: this.request.orgNumber?.trim() || undefined,
      fiscalYearStart:          App.toyyyyMMdd(this.currentYearStart),
      fiscalYearEnd:            App.toyyyyMMdd(this.currentYearEnd),
      previousFiscalYearStart:  App.toyyyyMMdd(this.previousYearStart),
      previousFiscalYearEnd:    App.toyyyyMMdd(this.previousYearEnd),
      seed: this.request.seed !== null && this.request.seed !== undefined ? Number(this.request.seed) : null,
    };
  }
}
