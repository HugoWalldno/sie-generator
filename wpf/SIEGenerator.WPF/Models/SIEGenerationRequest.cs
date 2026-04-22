namespace SIEGenerator.WPF.Models;

public enum CompanyType
{
    AB,   // Aktiebolag
    E,    // Enskild firma
    EK,   // Ekonomisk förening
    BRF,  // Bostadsrättsförening
    HB,   // Handelsbolag
    KB    // Kommanditbolag
}

public class SIEGenerationRequest
{
    /// <summary>1 = SIE 1 (balances only), 4 = SIE 4 (full transactions)</summary>
    public int SieType { get; set; } = 1;

    /// <summary>Company type, affects which accounts are used and writes #FTYP</summary>
    public CompanyType CompanyType { get; set; } = CompanyType.AB;

    public string? CompanyName { get; set; }
    public string? OrgNumber { get; set; }

    /// <summary>Format: yyyyMMdd — current/ongoing fiscal year start</summary>
    public string? FiscalYearStart { get; set; }

    /// <summary>Format: yyyyMMdd — current/ongoing fiscal year end</summary>
    public string? FiscalYearEnd { get; set; }

    /// <summary>Format: yyyyMMdd — previous fiscal year start (RAR -1)</summary>
    public string? PreviousFiscalYearStart { get; set; }

    /// <summary>Format: yyyyMMdd — previous fiscal year end (RAR -1)</summary>
    public string? PreviousFiscalYearEnd { get; set; }

    /// <summary>E.g. BAS2020, BAS2016, EUBAS97</summary>
    public string AccountPlanType { get; set; } = "BAS2020";

    /// <summary>Number of BAS accounts to include (max 50)</summary>
    public int NumberOfAccounts { get; set; } = 20;

    /// <summary>Number of vouchers to generate (SIE 4 only, max 2000)</summary>
    public int NumberOfVouchers { get; set; } = 30;

    /// <summary>Optional seed for reproducible output</summary>
    public int? Seed { get; set; }
}
