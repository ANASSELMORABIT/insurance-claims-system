import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../context/AuthContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const mockUser = {
  token: "fake-token",
  email: "admin@insurance.com",
  firstName: "Admin",
  lastName: "System",
  role: "Admin",
  expiresAt: new Date().toISOString(),
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should start unauthenticated", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should authenticate after login", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe("admin@insurance.com");
  });

  it("should set isAdmin true for Admin role", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isAgent).toBe(false);
    expect(result.current.isClient).toBe(false);
  });

  it("should clear user after logout", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login(mockUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should set isAgent true for Agent role", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({ ...mockUser, role: "Agent" });
    });

    expect(result.current.isAgent).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });

  it("should set isClient true for Client role", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.login({ ...mockUser, role: "Client" });
    });

    expect(result.current.isClient).toBe(true);
    expect(result.current.isAdmin).toBe(false);
  });
});