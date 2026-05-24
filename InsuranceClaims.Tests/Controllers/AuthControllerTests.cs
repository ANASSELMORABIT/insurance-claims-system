using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using InsuranceClaims.Core.DTOs.Auth;
using Microsoft.AspNetCore.Mvc.Testing;

namespace InsuranceClaims.Tests.Controllers;

public class AuthControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Login_ShouldReturn401_WhenInvalidCredentials()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "wrong@email.com",
            Password = "WrongPassword123!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_ShouldReturn200_WhenValidCredentials()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "admin@insurance.com",
            Password = "Admin@1234!"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<AuthResponse>();
        content.Should().NotBeNull();
        content!.Token.Should().NotBeNullOrEmpty();
        content.Role.Should().Be("Admin");
    }

    [Fact]
    public async Task Me_ShouldReturn401_WhenNotAuthenticated()
    {
        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Me_ShouldReturn200_WhenAuthenticated()
    {
        // Arrange — login first
        var loginRequest = new LoginRequest
        {
            Email = "admin@insurance.com",
            Password = "Admin@1234!"
        };
        var loginResponse = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var loginData = await loginResponse.Content.ReadFromJsonAsync<AuthResponse>();

        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", loginData!.Token);

        // Act
        var response = await _client.GetAsync("/api/auth/me");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadFromJsonAsync<AuthResponse>();
        content!.Email.Should().Be("admin@insurance.com");
    }

    [Fact]
    public async Task Register_ShouldReturn201_WhenValidData()
    {
        // Arrange
        var request = new RegisterRequest
        {
            FirstName = "Test",
            LastName = "User",
            Email = $"test{Guid.NewGuid()}@test.com",
            Password = "Test@1234!",
            Role = "Client"
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}