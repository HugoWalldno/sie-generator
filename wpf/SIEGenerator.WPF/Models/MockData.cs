namespace SIEGenerator.WPF.Models;

public class MockCompany
{
    public string Name { get; set; } = string.Empty;
    public string OrgNumber { get; set; } = string.Empty;
    public string FiscalYearStart { get; set; } = string.Empty;
    public string FiscalYearEnd { get; set; } = string.Empty;
    public string PreviousFiscalYearStart { get; set; } = string.Empty;
    public string PreviousFiscalYearEnd { get; set; } = string.Empty;
    public string AccountPlanType { get; set; } = string.Empty;
    public CompanyType CompanyType { get; set; } = CompanyType.AB;
    public List<MockAccount> Accounts { get; set; } = [];
    public List<MockVoucher> Vouchers { get; set; } = [];
}

public class MockAccount
{
    public string Number { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal ClosingBalance { get; set; }
    /// <summary>Net result for result accounts (revenue/cost)</summary>
    public decimal Result { get; set; }
}

public class MockVoucher
{
    public string Series { get; set; } = "A";
    public int Number { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<MockTransaction> Transactions { get; set; } = [];
}

public class MockTransaction
{
    public string AccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}
