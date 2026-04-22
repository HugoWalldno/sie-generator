using System.Text;
using SIEGenerator.API.Models;

namespace SIEGenerator.API.Services;

public class SIEBuilderService
{
    private readonly MockDataService _mockDataService;

    public SIEBuilderService(MockDataService mockDataService)
    {
        _mockDataService = mockDataService;
    }

    public SIEGenerationResult Build(SIEGenerationRequest request)
    {
        bool includeVouchers = request.SieType == 4;
        var company = _mockDataService.Generate(request, includeVouchers);

        var content = request.SieType == 4
            ? BuildSIE4(company)
            : BuildSIE1(company);

        var sieType = request.SieType == 4 ? "4" : "1";
        var filename = $"{SanitizeFilename(company.Name)}_SIE{sieType}_{company.FiscalYearStart[..4]}.se";

        return new SIEGenerationResult { Content = content, Filename = filename };
    }

    private static string BuildSIE1(MockCompany company)
    {
        var sb = new StringBuilder();
        WriteHeader(sb, company, 1);
        WriteAccounts(sb, company.Accounts);
        WriteBalances(sb, company.Accounts);
        return sb.ToString();
    }

    private static string BuildSIE4(MockCompany company)
    {
        var sb = new StringBuilder();
        WriteHeader(sb, company, 4);
        WriteAccounts(sb, company.Accounts);
        WriteBalances(sb, company.Accounts);
        WriteVouchers(sb, company.Vouchers);
        return sb.ToString();
    }

    private static void WriteHeader(StringBuilder sb, MockCompany company, int sieType)
    {
        string today = DateTime.UtcNow.ToString("yyyyMMdd");
        string kptyp = MapAccountPlanType(company.AccountPlanType);

        // TAXAR = the tax assessment year (fiscal year end year + 1)
        int taxYear = int.Parse(company.FiscalYearEnd[..4]) + 1;

        sb.AppendLine("#FLAGGA 0");
        sb.AppendLine("#FORMAT PC8");
        sb.AppendLine($"#SIETYP {sieType}");
        sb.AppendLine($"#PROGRAM \"SIE Mockgenerator\" 1.0");
        sb.AppendLine($"#GEN {today}");
        sb.AppendLine($"#FNAMN {SieToken(company.Name)}");
        sb.AppendLine($"#ORGNR {company.OrgNumber}");
        sb.AppendLine("#ADRESS \"\" \"\" \"\" \"\"");
        sb.AppendLine($"#FTYP {company.CompanyType}");
        sb.AppendLine($"#RAR 0 {company.FiscalYearStart} {company.FiscalYearEnd}");
        sb.AppendLine($"#RAR -1 {company.PreviousFiscalYearStart} {company.PreviousFiscalYearEnd}");
        sb.AppendLine($"#TAXAR {taxYear}");

        if (sieType == 4)
            sb.AppendLine("#VALUTA SEK");

        sb.AppendLine($"#KPTYP {kptyp}");
    }

    private static void WriteAccounts(StringBuilder sb, List<MockAccount> accounts)
    {
        foreach (var acc in accounts.OrderBy(a => a.Number))
        {
            sb.AppendLine($"#KONTO {acc.Number} {SieToken(acc.Name)}");
            var ktyp = acc.Type switch
            {
                AccountType.Asset => "T",
                AccountType.Liability => "S",
                AccountType.Revenue => "I",
                AccountType.Cost => "K",
                _ => null
            };
            if (ktyp != null)
                sb.AppendLine($"#KTYP {acc.Number} {ktyp}");
        }
    }

    private static void WriteBalances(StringBuilder sb, List<MockAccount> accounts)
    {
        foreach (var acc in accounts.Where(a => a.Type is AccountType.Asset or AccountType.Liability)
                                     .OrderBy(a => a.Number))
        {
            if (acc.OpeningBalance != 0)
                sb.AppendLine($"#IB 0 {acc.Number} {FormatAmount(acc.OpeningBalance)}");
        }

        foreach (var acc in accounts.Where(a => a.Type is AccountType.Asset or AccountType.Liability)
                                     .OrderBy(a => a.Number))
        {
            if (acc.ClosingBalance != 0)
                sb.AppendLine($"#UB 0 {acc.Number} {FormatAmount(acc.ClosingBalance)}");
        }

        foreach (var acc in accounts.Where(a => a.Type is AccountType.Revenue or AccountType.Cost or AccountType.Other)
                                     .OrderBy(a => a.Number))
        {
            if (acc.Result != 0)
                sb.AppendLine($"#RES 0 {acc.Number} {FormatAmount(acc.Result)}");
        }
    }

    private static void WriteVouchers(StringBuilder sb, List<MockVoucher> vouchers)
    {
        foreach (var voucher in vouchers.OrderBy(v => v.Series).ThenBy(v => v.Number))
        {
            sb.AppendLine($"#VER {voucher.Series} {voucher.Number} {voucher.Date} {SieToken(voucher.Description)}");
            sb.AppendLine("{");
            foreach (var trans in voucher.Transactions)
            {
                sb.AppendLine($"#TRANS {trans.AccountNumber} {{}} {FormatAmount(trans.Amount)}");
            }
            sb.AppendLine("}");
        }
    }

    private static string FormatAmount(decimal amount)
        => amount.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture);

    /// <summary>
    /// Returns the value quoted only if it contains spaces, matching the SIE spec tokenization.
    /// Empty values are returned as "".
    /// </summary>
    private static string SieToken(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "\"\"";
        var escaped = value.Replace("\"", "\\\"");
        return escaped.Contains(' ') ? $"\"{escaped}\"" : escaped;
    }

    /// <summary>Shifts the year portion of a yyyyMMdd date string by the given delta.</summary>
    private static string ShiftYearBy(string yyyyMMdd, int yearDelta)
    {
        if (yyyyMMdd.Length < 8) return yyyyMMdd;
        if (int.TryParse(yyyyMMdd[..4], out int year))
            return $"{year + yearDelta}{yyyyMMdd[4..]}";
        return yyyyMMdd;
    }

    private static string SanitizeFilename(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return new string(name.Where(c => !invalid.Contains(c) && c != ' ').ToArray());
    }

    /// <summary>
    /// Maps the account plan type to a valid SIE #KPTYP value.
    /// Per spec: types starting with BAS2 (e.g. BAS2025) shall be treated as EUBAS97.
    /// </summary>
    private static string MapAccountPlanType(string planType)
    {
        if (string.IsNullOrEmpty(planType)) return "EUBAS97";
        if (planType.StartsWith("BAS2", StringComparison.OrdinalIgnoreCase)) return "EUBAS97";
        return planType.ToUpperInvariant() switch
        {
            "BAS95" => "BAS95",
            "BAS96" => "BAS96",
            "EUBAS97" => "EUBAS97",
            "NE2007" => "NE2007",
            _ => "EUBAS97"
        };
    }
}
