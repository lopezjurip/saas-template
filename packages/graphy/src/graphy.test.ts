import type { DocumentTypeDecoration, ResultOf } from "@graphql-typed-document-node/core";
import { describe, expect, it, vi } from "vitest";
import {
  GraphyClient,
  GraphyClientSupabase,
  GraphyGraphQLError,
  GraphyNetworkError,
  GraphyResponseError,
  graphyRequest,
  isGraphyError,
  isGraphyGraphQLError,
  isGraphyNetworkError,
  isGraphyResponseError,
} from "./graphy";

// Mock fetch
global.fetch = vi.fn();

// Mock data
const mockQuery: DocumentTypeDecoration<{ test: string }, {}> = {
  toString: () => "query { test }",
} as DocumentTypeDecoration<{ test: string }, {}>;

type mockResult = ResultOf<typeof mockQuery>;
type mockResponse = { data: mockResult };

const mockVariables = { id: 1 };
const mockUrl = "https://example.com/graphql";
const mockInit = { headers: { "Content-Type": "application/json" } };

// Helper function to mock fetch responses
const mockFetchResponse = (response: any, ok = true) => {
  (fetch as any).mockResolvedValueOnce({
    ok,
    json: async () => response,
    text: async () => JSON.stringify(response),
  });
};

describe("graphyRequest", () => {
  it("should return data on successful request", async () => {
    const mockResponse = { data: { test: "value" } };
    mockFetchResponse(mockResponse);

    const result = await graphyRequest({ query: mockQuery, variables: mockVariables }, mockUrl, mockInit);
    expect(result).toEqual(mockResponse.data);
  });

  it("should throw GraphyNetworkError on network error", async () => {
    (fetch as any).mockRejectedValueOnce(new Error("Network error"));

    await expect(graphyRequest({ query: mockQuery, variables: mockVariables }, mockUrl, mockInit)).rejects.toThrow(
      GraphyNetworkError,
    );
  });

  it("should throw GraphyResponseError on non-200 response", async () => {
    const mockResponse = { message: "Internal Server Error" };
    mockFetchResponse(mockResponse, false);

    await expect(graphyRequest({ query: mockQuery, variables: mockVariables }, mockUrl, mockInit)).rejects.toThrow(
      GraphyResponseError,
    );
  });

  it("should throw GraphyGraphQLError on GraphQL errors", async () => {
    const mockResponse = { data: null, errors: [{ message: "GraphQL error" }] };
    mockFetchResponse(mockResponse);

    await expect(graphyRequest({ query: mockQuery, variables: mockVariables }, mockUrl, mockInit)).rejects.toThrow(
      GraphyGraphQLError,
    );
  });
});

describe("GraphyClient", () => {
  const client = new GraphyClient(mockUrl, mockInit);

  it("should fetch data successfully with typed result", async () => {
    const mockResponse = { data: { test: "value" } };
    mockFetchResponse(mockResponse);

    const result = await client.fetch({ query: mockQuery, variables: mockVariables });
    expect(result).toEqual(mockResponse.data);
    // Typescript should infer the type correctly.
    expect(result["test"]).toBe("value");
  });

  it("should handle query method correctly", async () => {
    const mockResponse = { data: { test: "value" } };
    mockFetchResponse(mockResponse);

    const result = await client.query({ query: mockQuery, variables: mockVariables });
    expect(result).toEqual({ data: mockResponse.data, error: null });
  });

  it("should handle mutate method correctly", async () => {
    const mockResponse = { data: { test: "value" } };
    mockFetchResponse(mockResponse);

    const result = await client.mutate({ query: mockQuery, variables: mockVariables });
    expect(result).toEqual({ data: mockResponse.data, error: null });
  });
});

describe("GraphyClientSupabase", () => {
  const client = new GraphyClientSupabase(mockUrl, "apikey", "access_token", mockInit);

  it("should hash access token", () => {
    expect(client.access_token_hash).toBe("377659293644219");
  });
});

describe("Error Guards", () => {
  it("should identify GraphyNetworkError", () => {
    const error = new GraphyNetworkError("Network error");
    expect(isGraphyNetworkError(error)).toBe(true);
  });

  it("should identify GraphyResponseError", () => {
    const error = new GraphyResponseError("Response error", 500);
    expect(isGraphyResponseError(error)).toBe(true);
  });

  it("should identify GraphyGraphQLError", () => {
    const error = new GraphyGraphQLError([{ message: "GraphQL error" } as any]);
    expect(isGraphyGraphQLError(error)).toBe(true);
  });

  it("should identify GraphyError", () => {
    expect(isGraphyError(new Error("Error"))).toBe(false);
  });

  it("should identify inherited GraphyError", () => {
    expect(isGraphyError(new GraphyNetworkError("Network error"))).toBe(true);
  });
});
