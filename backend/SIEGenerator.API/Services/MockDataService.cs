using SIEGenerator.API.Models;

namespace SIEGenerator.API.Services;

public class MockDataService
{
    private static readonly Dictionary<CompanyType, string[]> CompanySuffixes = new()
    {
        [CompanyType.AB]  = ["AB"],
        [CompanyType.E]   = [""],
        [CompanyType.EK]  = ["ekonomisk förening", "kooperativ"],
        [CompanyType.BRF] = ["Bostadsrättsförening"],
        [CompanyType.HB]  = ["HB", "Handelsbolag"],
        [CompanyType.KB]  = ["KB", "Kommanditbolag"],
    };

    private static readonly string[] CompanyNames =
    [
        "Nordisk Teknik", "Svenska Lösningar", "Bergström & Partners", "Lindqvist Consulting",
        "Söderström Handel", "Karlsson Bygg", "Eriksson Data", "Johansson Fastigheter",
        "Pettersson Redovisning", "Andersson & Söner", "Malmström Invest", "Holmberg Service",
        "Strand Förvaltning", "Eklund Industri", "Lundgren Media", "Nilsson Logistik",
        "Åberg Transport", "Öberg Finans", "Sjögren El", "Hedlund Automation"
    ];

    // ── Shared base accounts (assets/liabilities/costs common across all types) ──
    private static readonly List<AccountInfo> CommonAssets =
    [
        new("1510", "Kundfordringar", AccountType.Asset),
        new("1630", "Avräkning för skatter och avgifter (skattekonto)", AccountType.Asset),
        new("1650", "Momsfordran", AccountType.Asset),
        new("1710", "Förutbetalda hyreskostnader", AccountType.Asset),
        new("1730", "Förutbetalda försäkringspremier", AccountType.Asset),
        new("1790", "Övriga förutbetalda kostnader och upplupna intäkter", AccountType.Asset),
        new("1910", "Kassa", AccountType.Asset),
        new("1930", "Företagskonto/checkkonto", AccountType.Asset),
    ];

    private static readonly List<AccountInfo> CommonLiabilities =
    [
        new("2440", "Leverantörsskulder", AccountType.Liability),
        new("2510", "Skatteskulder", AccountType.Liability),
        new("2611", "Utgående moms 25%", AccountType.Liability),
        new("2640", "Ingående moms", AccountType.Asset),
        new("2710", "Personalens källskatt", AccountType.Liability),
        new("2730", "Lagstadgade sociala avgifter", AccountType.Liability),
        new("2920", "Upplupna semesterlöner", AccountType.Liability),
        new("2940", "Upplupna lagstadgade sociala avgifter", AccountType.Liability),
        new("2960", "Upplupna räntekostnader", AccountType.Liability),
    ];

    private static readonly List<AccountInfo> CommonRevenue =
    [
        new("3001", "Försäljning av tjänster 25% moms", AccountType.Revenue),
        new("3051", "Försäljning av varor 25% moms", AccountType.Revenue),
        new("3740", "Öres- och kronutjämning", AccountType.Revenue),
        new("3960", "Valutakursvinster", AccountType.Revenue),
    ];

    private static readonly List<AccountInfo> CommonCosts =
    [
        new("4010", "Inköp av material och varor", AccountType.Cost),
        new("5010", "Lokalhyra", AccountType.Cost),
        new("5020", "El för belysning", AccountType.Cost),
        new("5410", "Förbrukningsinventarier", AccountType.Cost),
        new("6110", "Kontorsmaterial", AccountType.Cost),
        new("6212", "Mobiltelefon", AccountType.Cost),
        new("6230", "Datakommunikation", AccountType.Cost),
        new("6250", "Postbefordran", AccountType.Cost),
        new("6310", "Företagsförsäkringar", AccountType.Cost),
        new("6530", "Redovisningstjänster", AccountType.Cost),
        new("6570", "Bankkostnader", AccountType.Cost),
        new("7010", "Löner till tjänstemän", AccountType.Cost),
        new("7210", "Arbetsgivaravgifter", AccountType.Cost),
        new("7290", "Förändring av semesterlöneskuld", AccountType.Cost),
        new("7510", "Arbetsgivaravgifter 31,42%", AccountType.Cost),
        new("7832", "Avskrivningar på inventarier och verktyg", AccountType.Cost),
        new("8410", "Räntekostnader", AccountType.Cost),
    ];

    // ── Equity accounts per company type ──
    private static readonly List<AccountInfo> EquityAB =
    [
        new("2081", "Aktiekapital", AccountType.Liability),
        new("2086", "Reservfond", AccountType.Liability),
        new("2091", "Balanserad vinst eller förlust", AccountType.Liability),
        new("2098", "Vinst eller förlust från föregående år", AccountType.Liability),
        new("2099", "Årets resultat", AccountType.Liability),
        new("2122", "Periodiseringsfond 2022", AccountType.Liability),
        new("2123", "Periodiseringsfond 2023", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("2650", "Redovisningskonto för moms", AccountType.Liability),
        new("8310", "Ränteintäkter", AccountType.Revenue),
        new("8999", "Årets skattepliktiga resultat", AccountType.Other),
    ];

    private static readonly List<AccountInfo> EquityE =
    [
        new("2010", "Eget kapital, delägare 1", AccountType.Liability),
        new("2013", "Övriga egna uttag", AccountType.Liability),
        new("2017", "Egna insättningar", AccountType.Liability),
        new("2019", "Årets resultat, delägare 1", AccountType.Liability),
        new("2050", "Avsättning till expansionsfond", AccountType.Liability),
        new("2080", "Periodiseringsfonder", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("8310", "Ränteintäkter", AccountType.Revenue),
        new("8999", "Årets skattepliktiga resultat", AccountType.Other),
    ];

    private static readonly List<AccountInfo> EquityEK =
    [
        new("2081", "Inbetalda insatser", AccountType.Liability),
        new("2083", "Medlemsinsatser", AccountType.Liability),
        new("2084", "Förlagsinsatser", AccountType.Liability),
        new("2091", "Balanserad vinst eller förlust", AccountType.Liability),
        new("2099", "Årets resultat", AccountType.Liability),
        new("2122", "Periodiseringsfond 2022", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("8310", "Ränteintäkter", AccountType.Revenue),
    ];

    private static readonly List<AccountInfo> EquityBRF =
    [
        new("2081", "Inbetalda insatser/grundavgifter", AccountType.Liability),
        new("2083", "Upplåtelseavgifter", AccountType.Liability),
        new("2091", "Balanserad vinst eller förlust", AccountType.Liability),
        new("2099", "Årets resultat", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("1110", "Byggnader", AccountType.Asset),
        new("1119", "Ackumulerade avskrivningar på byggnader", AccountType.Asset),
        new("1130", "Mark", AccountType.Asset),
        new("3911", "Hyresintäkter", AccountType.Revenue),
        new("5010", "Lokalhyra", AccountType.Cost),
        new("5170", "Reparation och underhåll av fastighet", AccountType.Cost),
        new("5191", "Fastighetsskatt/fastighetsavgift", AccountType.Cost),
        new("7820", "Avskrivningar på byggnader", AccountType.Cost),
        new("8310", "Ränteintäkter", AccountType.Revenue),
    ];

    private static readonly List<AccountInfo> EquityHB =
    [
        new("2010", "Eget kapital, delägare 1", AccountType.Liability),
        new("2013", "Övriga egna uttag", AccountType.Liability),
        new("2017", "Egna insättningar", AccountType.Liability),
        new("2019", "Årets resultat, delägare 1", AccountType.Liability),
        new("2020", "Eget kapital, delägare 2", AccountType.Liability),
        new("2023", "Övriga egna uttag, delägare 2", AccountType.Liability),
        new("2027", "Egna insättningar, delägare 2", AccountType.Liability),
        new("2029", "Årets resultat, delägare 2", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("8310", "Ränteintäkter", AccountType.Revenue),
        new("8999", "Årets skattepliktiga resultat", AccountType.Other),
    ];

    private static readonly List<AccountInfo> EquityKB =
    [
        new("2010", "Eget kapital, komplementär", AccountType.Liability),
        new("2013", "Övriga egna uttag, komplementär", AccountType.Liability),
        new("2017", "Egna insättningar, komplementär", AccountType.Liability),
        new("2019", "Årets resultat, komplementär", AccountType.Liability),
        new("2020", "Eget kapital, kommanditdelägare", AccountType.Liability),
        new("2027", "Insatt kapital, kommanditdelägare", AccountType.Liability),
        new("2029", "Årets resultat, kommanditdelägare", AccountType.Liability),
        new("2350", "Skulder till kreditinstitut, långfristiga", AccountType.Liability),
        new("8310", "Ränteintäkter", AccountType.Revenue),
        new("8999", "Årets skattepliktiga resultat", AccountType.Other),
    ];

    private static List<AccountInfo> GetAccountPool(CompanyType companyType)
    {
        var equity = companyType switch
        {
            CompanyType.AB  => EquityAB,
            CompanyType.E   => EquityE,
            CompanyType.EK  => EquityEK,
            CompanyType.BRF => EquityBRF,
            CompanyType.HB  => EquityHB,
            CompanyType.KB  => EquityKB,
            _               => EquityAB
        };

        // Combine common + type-specific equity, deduplicate by account number
        return CommonAssets.Concat(CommonLiabilities).Concat(CommonRevenue).Concat(CommonCosts).Concat(equity)
            .GroupBy(a => a.Number)
            .Select(g => g.First())
            .ToList();
    }

    private static readonly string[] VoucherDescriptions =
    [
        "Leverantörsfaktura", "Kundfaktura", "Löner", "Hyresbetalning", "Bankavgifter",
        "Programvarulicens", "Kontorsmaterial", "Representation", "Reklamkampanj",
        "Konsulttjänst", "Telefonräkning", "El och värme", "Försäkringspremie",
        "Momsdeklaration", "Skatteinbetalning", "Utlägg personal", "Inventarieköp",
        "Räntebetalning", "Dividend", "Kapitalinsättning"
    ];

    public MockCompany Generate(SIEGenerationRequest request, bool includeVouchers)
    {
        var seed = request.Seed ?? (int)(DateTime.UtcNow.Ticks % int.MaxValue);
        var rng = new Random(seed);

        var company = new MockCompany
        {
            Name = request.CompanyName ?? GenerateCompanyName(rng, request.CompanyType),
            OrgNumber = request.OrgNumber ?? GenerateOrgNumber(rng),
            AccountPlanType = request.AccountPlanType,
            CompanyType = request.CompanyType
        };

        // Fiscal year (current/ongoing)
        int fyStartYear = DateTime.UtcNow.Year - 1;
        company.FiscalYearStart = request.FiscalYearStart ?? $"{fyStartYear}0101";
        company.FiscalYearEnd = request.FiscalYearEnd ?? $"{fyStartYear}1231";

        // Previous fiscal year (RAR -1) — use supplied values or fall back to one year earlier
        string prevDefault = $"{fyStartYear - 1}";
        company.PreviousFiscalYearStart = request.PreviousFiscalYearStart ?? $"{prevDefault}0101";
        company.PreviousFiscalYearEnd = request.PreviousFiscalYearEnd ?? $"{prevDefault}1231";

        // Pick accounts from the company-type-specific pool
        var pool = GetAccountPool(request.CompanyType);
        int count = Math.Clamp(request.NumberOfAccounts, 5, pool.Count);
        var chosenAccounts = PickAccounts(rng, count, pool, request.CompanyType);
        company.Accounts = GenerateAccountBalances(rng, chosenAccounts);

        if (includeVouchers)
        {
            int voucherCount = Math.Clamp(request.NumberOfVouchers, 1, 2000);
            company.Vouchers = GenerateVouchers(rng, company.Accounts, company.FiscalYearStart, company.FiscalYearEnd, voucherCount);
        }

        return company;
    }

    private static string GenerateCompanyName(Random rng, CompanyType companyType)
    {
        var name = CompanyNames[rng.Next(CompanyNames.Length)];
        var suffixes = CompanySuffixes[companyType];
        var suffix = suffixes[rng.Next(suffixes.Length)];
        return string.IsNullOrEmpty(suffix) ? name : $"{name} {suffix}";
    }

    private static string GenerateOrgNumber(Random rng)
    {
        // Swedish org number format: XXXXXX-XXXX
        int part1 = rng.Next(100000, 999999);
        int part2 = rng.Next(1000, 9999);
        return $"{part1}-{part2}";
    }

    private static List<AccountInfo> PickAccounts(Random rng, int count, List<AccountInfo> pool, CompanyType companyType)
    {
        // Always include a few essential accounts based on company type
        var essentialNumbers = companyType switch
        {
            CompanyType.AB  => new[] { "1930", "2081", "2099", "3001", "7010", "2440" },
            CompanyType.E   => new[] { "1930", "2010", "2017", "3001", "7010", "2440" },
            CompanyType.EK  => new[] { "1930", "2083", "2099", "3001", "7010", "2440" },
            CompanyType.BRF => new[] { "1930", "2081", "2099", "3911", "5010", "2440" },
            CompanyType.HB  => new[] { "1930", "2010", "2020", "3001", "7010", "2440" },
            CompanyType.KB  => new[] { "1930", "2010", "2020", "3001", "7010", "2440" },
            _               => new[] { "1930", "2081", "2099", "3001", "7010", "2440" },
        };

        var essential = pool.Where(a => essentialNumbers.Contains(a.Number)).ToList();
        var rest = pool.Except(essential).OrderBy(_ => rng.Next()).Take(Math.Max(0, count - essential.Count)).ToList();
        return [.. essential, .. rest];
    }

    private static List<MockAccount> GenerateAccountBalances(Random rng, List<AccountInfo> accounts)
    {
        var result = new List<MockAccount>();
        foreach (var acc in accounts)
        {
            var mockAcc = new MockAccount
            {
                Number = acc.Number,
                Name = acc.Name,
                Type = acc.Type
            };

            switch (acc.Type)
            {
                case AccountType.Asset:
                    mockAcc.OpeningBalance = Math.Round((decimal)(rng.NextDouble() * 500000), 2);
                    mockAcc.ClosingBalance = Math.Round((decimal)(rng.NextDouble() * 600000), 2);
                    break;
                case AccountType.Liability:
                    // Liabilities are negative in SIE
                    mockAcc.OpeningBalance = -Math.Round((decimal)(rng.NextDouble() * 400000), 2);
                    mockAcc.ClosingBalance = -Math.Round((decimal)(rng.NextDouble() * 450000), 2);
                    break;
                case AccountType.Revenue:
                    mockAcc.Result = -Math.Round((decimal)(rng.NextDouble() * 1000000 + 100000), 2);
                    break;
                case AccountType.Cost:
                    mockAcc.Result = Math.Round((decimal)(rng.NextDouble() * 500000 + 10000), 2);
                    break;
                default:
                    mockAcc.Result = Math.Round((decimal)(rng.NextDouble() * 10000 - 5000), 2);
                    break;
            }

            result.Add(mockAcc);
        }
        return result;
    }

    private static List<MockVoucher> GenerateVouchers(
        Random rng, List<MockAccount> accounts, string startDate, string endDate, int count)
    {
        var vouchers = new List<MockVoucher>();
        var start = ParseDate(startDate);
        var end = ParseDate(endDate);
        int totalDays = (end - start).Days;

        var balanceAccounts = accounts.Where(a => a.Type is AccountType.Asset or AccountType.Liability).ToList();
        var resultAccounts = accounts.Where(a => a.Type is AccountType.Revenue or AccountType.Cost).ToList();

        if (balanceAccounts.Count < 2) return vouchers;

        string[] series = ["A", "B", "C"];
        var seriesCounters = new Dictionary<string, int> { ["A"] = 1, ["B"] = 1, ["C"] = 1 };

        for (int i = 0; i < count; i++)
        {
            var date = start.AddDays(rng.Next(0, Math.Max(1, totalDays)));
            var description = VoucherDescriptions[rng.Next(VoucherDescriptions.Length)];
            decimal amount = Math.Round((decimal)(rng.NextDouble() * 50000 + 500), 2);
            var selectedSeries = series[rng.Next(series.Length)];

            var voucher = new MockVoucher
            {
                Series = selectedSeries,
                Number = seriesCounters[selectedSeries]++,
                Date = date.ToString("yyyyMMdd"),
                Description = description,
                Transactions = []
            };

            // Pick debit and credit accounts
            var debitAcc = balanceAccounts[rng.Next(balanceAccounts.Count)];

            // If result accounts exist, sometimes use them
            MockAccount creditAcc;
            if (resultAccounts.Count > 0 && rng.Next(2) == 0)
            {
                creditAcc = resultAccounts[rng.Next(resultAccounts.Count)];
            }
            else
            {
                creditAcc = balanceAccounts[rng.Next(balanceAccounts.Count)];
                while (creditAcc.Number == debitAcc.Number && balanceAccounts.Count > 1)
                    creditAcc = balanceAccounts[rng.Next(balanceAccounts.Count)];
            }

            voucher.Transactions.Add(new MockTransaction
            {
                AccountNumber = debitAcc.Number,
                Amount = amount,
                Description = description
            });
            voucher.Transactions.Add(new MockTransaction
            {
                AccountNumber = creditAcc.Number,
                Amount = -amount,
                Description = description
            });

            vouchers.Add(voucher);
        }

        return vouchers;
    }

    private static DateTime ParseDate(string yyyyMMdd)
    {
        if (DateTime.TryParseExact(yyyyMMdd, "yyyyMMdd",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var dt))
            return dt;
        return DateTime.UtcNow.Date;
    }
}
