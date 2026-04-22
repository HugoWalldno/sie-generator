namespace SIEGenerator.API.Models;

public record AccountInfo(string Number, string Name, AccountType Type);

public enum AccountType
{
    Asset,
    Liability,
    Revenue,
    Cost,
    Other
}
