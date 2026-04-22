import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SIEGenerationRequest {
  sieType: number;
  companyType: string;
  companyName?: string;
  orgNumber?: string;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  previousFiscalYearStart?: string;
  previousFiscalYearEnd?: string;
  accountPlanType: string;
  numberOfAccounts: number;
  numberOfVouchers: number;
  seed?: number | null;
}

export interface SIEGenerationResult {
  content: string;
  filename: string;
}

@Injectable({ providedIn: 'root' })
export class SieService {
  private readonly apiBase = 'http://localhost:5000/api/sie';

  constructor(private http: HttpClient) {}

  preview(request: SIEGenerationRequest): Observable<SIEGenerationResult> {
    return this.http.post<SIEGenerationResult>(`${this.apiBase}/generate`, request);
  }

  download(request: SIEGenerationRequest): Observable<Blob> {
    return this.http.post(`${this.apiBase}/download`, request, { responseType: 'blob' });
  }
}
