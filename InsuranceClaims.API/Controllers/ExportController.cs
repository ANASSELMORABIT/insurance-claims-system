using ClosedXML.Excel;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace InsuranceClaims.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExportController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ExportController(ApplicationDbContext context)
    {
        _context = context;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    [HttpGet("claims/excel")]
    public async Task<IActionResult> ExportClaimsExcel()
    {
        var claims = await _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Agent)
            .Include(c => c.Policy)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Claims");

        // Header
        var headers = new[] { "ID", "Title", "Type", "Status", "Client", "Agent", "Policy", "Amount", "Incident Date", "Created At" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#0a0a14");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // Data
        for (int i = 0; i < claims.Count; i++)
        {
            var c = claims[i];
            var row = i + 2;
            ws.Cell(row, 1).Value = c.Id;
            ws.Cell(row, 2).Value = c.Title;
            ws.Cell(row, 3).Value = c.Type.ToString();
            ws.Cell(row, 4).Value = c.Status.ToString();
            ws.Cell(row, 5).Value = c.Client != null ? $"{c.Client.FirstName} {c.Client.LastName}" : "";
            ws.Cell(row, 6).Value = c.Agent != null ? $"{c.Agent.FirstName} {c.Agent.LastName}" : "Unassigned";
            ws.Cell(row, 7).Value = c.Policy?.PolicyNumber ?? "";
            ws.Cell(row, 8).Value = c.EstimatedAmount ?? 0;
            ws.Cell(row, 9).Value = c.IncidentDate.ToString("yyyy-MM-dd");
            ws.Cell(row, 10).Value = c.CreatedAt.ToString("yyyy-MM-dd");
        }

        ws.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;

        return File(stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"claims-export-{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("claims/pdf")]
    public async Task<IActionResult> ExportClaimsPdf()
    {
        var claims = await _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Policy)
            .OrderByDescending(c => c.CreatedAt)
            .Take(50)
            .ToListAsync();

        var pdf = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(30);
                page.DefaultTextStyle(x => x.FontSize(9));

                page.Header().Column(col =>
                {
                    col.Item().Row(row =>
                    {
                        row.RelativeItem().Text("InsureClaims — Claims Report")
                            .FontSize(18).Bold().FontColor("#00D4FF");
                        row.ConstantItem(150).AlignRight()
                            .Text($"Generated: {DateTime.UtcNow:yyyy-MM-dd}")
                            .FontColor("#64748b");
                    });
                    col.Item().PaddingTop(4).LineHorizontal(1).LineColor("#1e293b");
                });

                page.Content().PaddingTop(16).Table(table =>
                {
                    table.ColumnsDefinition(cols =>
                    {
                        cols.ConstantColumn(30);
                        cols.RelativeColumn(3);
                        cols.RelativeColumn(1);
                        cols.RelativeColumn(1);
                        cols.RelativeColumn(2);
                        cols.RelativeColumn(1);
                        cols.RelativeColumn(1);
                    });

                    // Header
                    // Header
                    table.Header(header =>
                    {
                        foreach (var h in new[] { "ID", "Title", "Type", "Status", "Client", "Policy", "Amount" })
                        {
                            header.Cell().Background("#0d0d1a").Padding(6)
                                .Text(h).Bold().FontColor("#00D4FF").FontSize(8);
                        }
                    });
                    // Rows
                    foreach (var c in claims)
                    {
                        var bg = claims.IndexOf(c) % 2 == 0 ? "#070710" : "#0a0a14";
                        table.Cell().Background(bg).Padding(6).Text(c.Id.ToString()).FontColor("#94a3b8");
                        table.Cell().Background(bg).Padding(6).Text(c.Title).FontColor("#e2e8f0");
                        table.Cell().Background(bg).Padding(6).Text(c.Type.ToString()).FontColor("#94a3b8");
                        table.Cell().Background(bg).Padding(6).Text(c.Status.ToString()).FontColor(
                            c.Status.ToString() == "Approved" ? "#00FF94" :
                            c.Status.ToString() == "Rejected" ? "#FF6B6B" :
                            c.Status.ToString() == "Pending" ? "#FFB800" : "#00D4FF"
                        );
                        table.Cell().Background(bg).Padding(6)
                            .Text(c.Client != null ? $"{c.Client.FirstName} {c.Client.LastName}" : "").FontColor("#94a3b8");
                        table.Cell().Background(bg).Padding(6).Text(c.Policy?.PolicyNumber ?? "").FontColor("#94a3b8");
                        table.Cell().Background(bg).Padding(6)
                            .Text(c.EstimatedAmount.HasValue ? $"${c.EstimatedAmount:N0}" : "—").FontColor("#00FF94");
                    }
                });

                page.Footer().AlignCenter()
                    .Text(t =>
                    {
                        t.Span("InsureClaims System — Page ").FontColor("#475569");
                        t.CurrentPageNumber().FontColor("#475569");
                        t.Span(" of ").FontColor("#475569");
                        t.TotalPages().FontColor("#475569");
                    });
            });
        });

        var bytes = pdf.GeneratePdf();
        return File(bytes, "application/pdf", $"claims-report-{DateTime.UtcNow:yyyyMMdd}.pdf");
    }
}