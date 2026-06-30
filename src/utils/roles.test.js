import { describe, it, expect } from "vitest";
import { canManageEvent } from "./roles";
import { ROLES } from "../constants/auth";

const evento = { id: "ev-1", eventOwner: "user-owner-1" };

describe("canManageEvent", () => {
  it("un admin puede administrar cualquier evento (aunque no sea owner)", () => {
    const user = { id: "x", role: ROLES.ADMIN };
    expect(canManageEvent(user, evento)).toBe(true);
  });

  it("un superadmin puede administrar cualquier evento", () => {
    const user = { id: "x", role: ROLES.SUPER_ADMIN };
    expect(canManageEvent(user, evento)).toBe(true);
  });

  it("el dueño del evento puede administrarlo", () => {
    const user = { id: "user-owner-1", role: ROLES.USER };
    expect(canManageEvent(user, evento)).toBe(true);
  });

  it("compara owner e id como strings (tolerante a Guid/number)", () => {
    const user = { id: 42, role: ROLES.USER };
    expect(canManageEvent(user, { id: "ev", eventOwner: "42" })).toBe(true);
  });

  it("un usuario que no es admin ni dueño no puede administrar", () => {
    const user = { id: "otro", role: ROLES.USER };
    expect(canManageEvent(user, evento)).toBe(false);
  });

  it("sin usuario (no logueado) no puede administrar", () => {
    expect(canManageEvent(null, evento)).toBe(false);
  });

  it("sin evento, un no-admin no puede administrar", () => {
    const user = { id: "user-owner-1", role: ROLES.USER };
    expect(canManageEvent(user, null)).toBe(false);
  });

  it("acepta el rol en la propiedad rol además de role", () => {
    const user = { id: "x", rol: ROLES.ADMIN };
    expect(canManageEvent(user, evento)).toBe(true);
  });
});
