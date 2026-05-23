using InsuranceClaims.Core.DTOs.Reports;

namespace InsuranceClaims.Core.Interfaces;

public interface IReportsService
{
    Task<ReportsOverviewDto> GetOverviewAsync();
}