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
  assert.equal(validateEmail(""), "Escribe tu correo. Ejemplo: nombre@correo.com.");
  assert.equal(validateEmail("   "), "Escribe tu correo. Ejemplo: nombre@correo.com.");
});

test("validateEmail explains that the @ is missing", () => {
  assert.equal(
    validateEmail("lunacorreo.com"),
    "Falta la @. El correo debe ser como nombre@correo.com.",
  );
});

test("validateEmail rejects spaces", () => {
  assert.equal(
    validateEmail("luna mideros@correo.com"),
    "El correo no puede llevar espacios. Ejemplo: nombre@correo.com.",
  );
});

test("validateEmail rejects @ at the start or end", () => {
  assert.equal(
    validateEmail("@correo.com"),
    "Antes de la @ falta el nombre. Ejemplo: nombre@correo.com.",
  );
  assert.equal(
    validateEmail("luna@"),
    "Después de la @ falta el dominio. Ejemplo: nombre@correo.com.",
  );
});

test("validateEmail rejects more than one @", () => {
  assert.equal(
    validateEmail("a@b@c.com"),
    "El correo solo puede llevar una @. Ejemplo: nombre@correo.com.",
  );
});

test("validateEmail requires a dot in the domain", () => {
  assert.equal(
    validateEmail("luna@correo"),
    "Al dominio del correo le falta un punto, como correo.com.",
  );
});

test("validateEmail rejects a domain starting or ending with a dot", () => {
  assert.equal(
    validateEmail("luna@.com"),
    "Después de la @ no puede ir un punto. Escribe el dominio, como correo.com.",
  );
  assert.equal(
    validateEmail("luna@correo."),
    "El dominio no puede terminar con punto. Ejemplo: correo.com.",
  );
});

test("validateEmail rejects two dots in a row", () => {
  assert.equal(
    validateEmail("luna@correo..com"),
    "El dominio no puede tener dos puntos seguidos. Ejemplo: correo.com.",
  );
});

test("validateEmail explains the common gabis@.com mistake", () => {
  assert.equal(
    validateEmail("gabis@.com"),
    "Después de la @ no puede ir un punto. Escribe el dominio, como correo.com.",
  );
});

test("validatePassword accepts 8+ characters", () => {
  assert.equal(validatePassword("abc12345"), null);
  assert.equal(validatePassword("a".repeat(120)), null);
});

test("validatePassword rejects empty and short passwords", () => {
  assert.equal(validatePassword(""), "Escribe una contraseña.");
  assert.equal(validatePassword("abc123"), "La contraseña necesita al menos 8 caracteres.");
});

test("validateDisplayName accepts 2-40 characters", () => {
  assert.equal(validateDisplayName("Luna"), null);
  assert.equal(validateDisplayName("A".repeat(40)), null);
});

test("validateDisplayName rejects empty, short, and long names", () => {
  assert.equal(validateDisplayName(""), "Escribe el nombre con el que quieres aparecer.");
  assert.equal(validateDisplayName("X"), "El nombre necesita al menos 2 caracteres.");
  assert.equal(validateDisplayName("A".repeat(41)), "El nombre es demasiado largo (máximo 40 caracteres).");
});

test("validateLogin combines email and password errors", () => {
  const errors = validateLogin({ email: "", password: "123" });

  assert.equal(errors.email, "Escribe tu correo. Ejemplo: nombre@correo.com.");
  assert.equal(errors.password, "La contraseña necesita al menos 8 caracteres.");
  assert.equal(errors.displayName, null);
});

test("validateRegister combines all three field errors", () => {
  const errors = validateRegister({ email: "noarroba", password: "123", displayName: "X" });

  assert.equal(errors.email, "Falta la @. El correo debe ser como nombre@correo.com.");
  assert.equal(errors.password, "La contraseña necesita al menos 8 caracteres.");
  assert.equal(errors.displayName, "El nombre necesita al menos 2 caracteres.");
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
