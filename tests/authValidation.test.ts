import assert from "node:assert/strict";
import test from "node:test";
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateLogin,
  validateRegister,
  passwordStrength,
  hasErrors,
} from "../src/lib/authValidation.ts";

test("validateEmail accepts a valid email with one @", () => {
  assert.equal(validateEmail("luna@correo.com"), null);
  assert.equal(validateEmail("a@b.c"), null);
});

test("validateEmail rejects empty email", () => {
  assert.equal(validateEmail(""), "El correo es obligatorio.");
  assert.equal(validateEmail("   "), "El correo es obligatorio.");
});

test("validateEmail requires the @ symbol", () => {
  assert.equal(validateEmail("lunacorreo.com"), "El correo debe incluir una @.");
});

test("validateEmail rejects @ at the start or end", () => {
  assert.equal(validateEmail("@correo.com"), "Falta el nombre de usuario antes de la @.");
  assert.equal(validateEmail("luna@"), "Falta el dominio después de la @.");
});

test("validateEmail rejects more than one @", () => {
  assert.equal(validateEmail("a@b@c.com"), "El correo no puede llevar más de una @.");
});

test("validateEmail requires a dot in the domain", () => {
  assert.equal(
    validateEmail("luna@correo"),
    "El dominio del correo debe llevar un punto, como correo.com.",
  );
});

test("validateEmail rejects a domain starting or ending with a dot", () => {
  assert.equal(
    validateEmail("luna@.com"),
    "El dominio del correo no puede empezar ni terminar con punto.",
  );
  assert.equal(
    validateEmail("luna@correo."),
    "El dominio del correo no puede empezar ni terminar con punto.",
  );
});

test("validatePassword accepts 8+ characters", () => {
  assert.equal(validatePassword("abc12345"), null);
  assert.equal(validatePassword("a".repeat(120)), null);
});

test("validatePassword rejects empty and short passwords", () => {
  assert.equal(validatePassword(""), "La contraseña es obligatoria.");
  assert.equal(validatePassword("abc123"), "La contraseña debe tener al menos 8 caracteres.");
});

test("validateDisplayName accepts 2-40 characters", () => {
  assert.equal(validateDisplayName("Luna"), null);
  assert.equal(validateDisplayName("A".repeat(40)), null);
});

test("validateDisplayName rejects empty, short, and long names", () => {
  assert.equal(validateDisplayName(""), "El nombre a mostrar es obligatorio.");
  assert.equal(validateDisplayName("X"), "El nombre es demasiado corto (mínimo 2 caracteres).");
  assert.equal(validateDisplayName("A".repeat(41)), "El nombre es demasiado largo (máximo 40 caracteres).");
});

test("validateLogin combines email and password errors", () => {
  const errors = validateLogin({ email: "", password: "123" });

  assert.equal(errors.email, "El correo es obligatorio.");
  assert.equal(errors.password, "La contraseña debe tener al menos 8 caracteres.");
  assert.equal(errors.displayName, null);
});

test("validateRegister combines all three field errors", () => {
  const errors = validateRegister({ email: "noarroba", password: "123", displayName: "X" });

  assert.equal(errors.email, "El correo debe incluir una @.");
  assert.equal(errors.password, "La contraseña debe tener al menos 8 caracteres.");
  assert.equal(errors.displayName, "El nombre es demasiado corto (mínimo 2 caracteres).");
});

test("hasErrors returns true when any field fails", () => {
  assert.equal(hasErrors({ email: "x", password: null, displayName: null }), true);
  assert.equal(hasErrors({ email: null, password: null, displayName: null }), false);
});

test("passwordStrength scores length, case, digits and symbols", () => {
  assert.equal(passwordStrength("").score, 0);
  assert.equal(passwordStrength("abc").score, 0);
  assert.equal(passwordStrength("abcdefgh").score, 1);
  assert.equal(passwordStrength("Abcdefgh").score, 2);
  assert.equal(passwordStrength("Abcdefgh1").score, 3);
  assert.equal(passwordStrength("Abcdefgh1!").score, 4);
});

test("passwordStrength labels map to scores", () => {
  assert.equal(passwordStrength("").label, "Demasiado corta");
  assert.equal(passwordStrength("Abcdefgh1!").label, "Muy fuerte");
});
