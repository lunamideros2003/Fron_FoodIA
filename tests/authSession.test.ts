import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import {
  readAuthToken,
  saveAuthToken,
  clearAuthToken,
} from "../src/lib/authSession.ts";

const TOKEN_KEY = "foodmood.authToken";

class StorageStub implements Storage {
  #map = new Map<string, string>();
  get length(): number {
    return this.#map.size;
  }
  getItem(key: string): string | null {
    return this.#map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.#map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.#map.delete(key);
  }
  clear(): void {
    this.#map.clear();
  }
  key(index: number): string | null {
    return Array.from(this.#map.keys())[index] ?? null;
  }
}

afterEach(() => {
  // Restores a clean, throwing-free storage for the next case.
  globalThis.localStorage = new StorageStub() as Storage;
});

describe("auth session storage", () => {
  it("reads null when nothing was saved", () => {
    assert.equal(readAuthToken(), null);
  });

  it("saves, reads and trims the bearer token", () => {
    saveAuthToken("  token-abc  ");
    assert.equal(localStorage.getItem(TOKEN_KEY), "token-abc");
    assert.equal(readAuthToken(), "token-abc");
  });

  it("removes the token on logout", () => {
    saveAuthToken("token-abc");
    clearAuthToken();
    assert.equal(readAuthToken(), null);
    assert.equal(localStorage.getItem(TOKEN_KEY), null);
  });

  it("ignores an empty token instead of storing it", () => {
    saveAuthToken("   ");
    assert.equal(readAuthToken(), null);
  });

  it("survives a storage that refuses writes", () => {
    globalThis.localStorage = {
      setItem() {
        throw new Error("quota");
      },
      getItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    } as unknown as Storage;

    saveAuthToken("token-abc");
    assert.doesNotThrow(() => readAuthToken());
    assert.equal(readAuthToken(), null);
    assert.doesNotThrow(() => clearAuthToken());
  });
});
