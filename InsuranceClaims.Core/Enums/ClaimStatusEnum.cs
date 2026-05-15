namespace InsuranceClaims.Core.Enums;

public enum ClaimStatusType
{
    Pending = 1,
    UnderReview = 2,
    Approved = 3,
    Rejected = 4,
    Closed = 5
}

public enum ClaimType
{
    Auto = 1,
    Home = 2,
    Health = 3,
    Life = 4,
    Travel = 5
}

public enum UserRole
{
    Admin = 1,
    Agent = 2,
    Client = 3
}