namespace InsuranceClaims.Core.DTOs.Search;

public class SearchResultDto
{
    public List<SearchItemDto> Results { get; set; } = new();
    public int TotalCount { get; set; }
    public string Query { get; set; } = string.Empty;
}

public class SearchItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string BadgeColor { get; set; } = string.Empty;
}