using System.IO;
using System.Windows;
using System.Windows.Controls;
using SIEGenerator.WPF.Models;
using SIEGenerator.WPF.Services;

namespace SIEGenerator.WPF;

public partial class MainWindow : Window
{
    private readonly SIEBuilderService _builder = new(new MockDataService());
    private SIEGenerationResult? _lastResult;

    public MainWindow()
    {
        InitializeComponent();
        SetDefaultDates();
        CompanyTypeCombo.SelectedIndex = 0;
        AccountPlanCombo.SelectedIndex = 0;
    }

    private void SetDefaultDates()
    {
        int prevYear = DateTime.Today.Year - 2;
        int currYear = DateTime.Today.Year - 1;
        PrevYearStart.SelectedDate = new DateTime(prevYear, 1, 1);
        PrevYearEnd.SelectedDate   = new DateTime(prevYear, 12, 31);
        CurrYearStart.SelectedDate = new DateTime(currYear, 1, 1);
        CurrYearEnd.SelectedDate   = new DateTime(currYear, 12, 31);
    }

    private void SieTypeRadio_Changed(object sender, RoutedEventArgs e)
    {
        if (VouchersPanel is null) return;
        VouchersPanel.Visibility = SieType4Radio.IsChecked == true
            ? Visibility.Visible
            : Visibility.Collapsed;
    }

    private void GenerateButton_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            var request = BuildRequest();
            _lastResult = _builder.Build(request);

            PreviewBox.Text      = _lastResult.Content;
            FilenameLabel.Text   = _lastResult.Filename;

            PlaceholderText.Visibility = Visibility.Collapsed;
            PreviewScroll.Visibility   = Visibility.Visible;
            ResultHeader.Visibility    = Visibility.Visible;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Fel vid generering:\n{ex.Message}", "Fel",
                MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    private void SaveButton_Click(object sender, RoutedEventArgs e)
    {
        if (_lastResult is null) return;

        var dialog = new Microsoft.Win32.SaveFileDialog
        {
            FileName    = _lastResult.Filename,
            Filter      = "SIE-filer (*.se)|*.se|Alla filer (*.*)|*.*",
            DefaultExt  = ".se",
            Title       = "Spara SIE-fil"
        };

        if (dialog.ShowDialog() != true) return;

        // SIE standard requires CP437 (PC8) encoding
        System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
        var encoding = System.Text.Encoding.GetEncoding(437);
        File.WriteAllBytes(dialog.FileName, encoding.GetBytes(_lastResult.Content));
    }

    private SIEGenerationRequest BuildRequest()
    {
        var request = new SIEGenerationRequest
        {
            SieType          = SieType4Radio.IsChecked == true ? 4 : 1,
            CompanyType      = GetSelectedCompanyType(),
            CompanyName      = NullIfEmpty(CompanyNameBox.Text),
            OrgNumber        = NullIfEmpty(OrgNumberBox.Text),
            AccountPlanType  = (AccountPlanCombo.SelectedItem as ComboBoxItem)?.Content?.ToString() ?? "BAS2020",
            NumberOfAccounts = int.TryParse(NumAccountsBox.Text, out int na) ? na : 20,
            NumberOfVouchers = int.TryParse(NumVouchersBox.Text, out int nv) ? nv : 30,
            Seed             = int.TryParse(SeedBox.Text, out int seed) ? seed : null,
        };

        if (PrevYearStart.SelectedDate.HasValue)
            request.PreviousFiscalYearStart = PrevYearStart.SelectedDate.Value.ToString("yyyyMMdd");
        if (PrevYearEnd.SelectedDate.HasValue)
            request.PreviousFiscalYearEnd = PrevYearEnd.SelectedDate.Value.ToString("yyyyMMdd");
        if (CurrYearStart.SelectedDate.HasValue)
            request.FiscalYearStart = CurrYearStart.SelectedDate.Value.ToString("yyyyMMdd");
        if (CurrYearEnd.SelectedDate.HasValue)
            request.FiscalYearEnd = CurrYearEnd.SelectedDate.Value.ToString("yyyyMMdd");

        return request;
    }

    private CompanyType GetSelectedCompanyType()
    {
        var tag = (CompanyTypeCombo.SelectedItem as ComboBoxItem)?.Tag?.ToString() ?? "AB";
        return Enum.TryParse<CompanyType>(tag, out var ct) ? ct : CompanyType.AB;
    }

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
