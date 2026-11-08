/**
 * Login and registration form validation.
 *
 * These run in the browser before calling the API: they give immediate
 * feedback without a server round trip. The backend validates again with Zod,
 * so these rules are a UX layer, not a security layer.
 */

export interface FieldError {
  field: "email" | "password" | "displayName";
  message: string;
}

/** Hints always shown under each field. */
export const EMAIL_HINT = "Debe llevar una @ y un dominio, como nombre@correo.com.";
export const PASSWORD_HINT = "Mínimo 8 caracteres.";
export const DISPLAY_NAME_HINT = "Entre 2 y 40 caracteres.";

const EMAIL_EXAMPLE = "nombre@correo.com";

/** A valid email has exactly one `@` and a domain with a dot. */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) return `Escribe tu correo. Ejemplo: ${EMAIL_EXAMPLE}.`;
  if (/\s/.test(trimmed)) return `El correo no puede llevar espacios. Ejemplo: ${EMAIL_EXAMPLE}.`;
  if (!trimmed.includes("@")) return `Falta la @. El correo debe ser como ${EMAIL_EXAMPLE}.`;
  if (trimmed.indexOf("@") === 0)
    return `Antes de la @ falta el nombre. Ejemplo: ${EMAIL_EXAMPLE}.`;
  if (trimmed.indexOf("@") === trimmed.length - 1)
    return `Después de la @ falta el dominio. Ejemplo: ${EMAIL_EXAMPLE}.`;
  if (trimmed.split("@").length !== 2)
    return `El correo solo puede llevar una @. Ejemplo: ${EMAIL_EXAMPLE}.`;
  if (trimmed.length > 120) return "El correo es demasiado largo (máximo 120 caracteres).";

  const domain = trimmed.split("@")[1];
  if (domain.startsWith("."))
    return "Después de la @ no puede ir un punto. Escribe el dominio, como correo.com.";
  if (domain.endsWith("."))
    return "El dominio no puede terminar con punto. Ejemplo: correo.com.";
  if (domain.includes(".."))
    return "El dominio no puede tener dos puntos seguidos. Ejemplo: correo.com.";
  if (!domain.includes("."))
    return "Al dominio del correo le falta un punto, como correo.com.";

  return null;
}

/** Password: between 8 and 120 characters. */
export function validatePassword(password: string): string | null {
  if (!password) return "Escribe una contraseña.";
  if (password.length < 8) return "La contraseña necesita al menos 8 caracteres.";
  if (password.length > 120)
    return "La contraseña es demasiado larga (máximo 120 caracteres).";

  return null;
}

/** Display name: between 2 and 40 characters. */
export function validateDisplayName(displayName: string): string | null {
  const trimmed = displayName.trim();

  if (!trimmed) return "Escribe el nombre con el que quieres aparecer.";
  if (trimmed.length < 2) return "El nombre necesita al menos 2 caracteres.";
  if (trimmed.length > 40) return "El nombre es demasiado largo (máximo 40 caracteres).";

  return null;
}

/** Result of validating a form: field → error message or null. */
export interface FormErrors {
  email: string | null;
  password: string | null;
  displayName: string | null;
}

const emptyErrors: FormErrors = { email: null, password: null, displayName: null };

/** Validates the login form fields. */
export function validateLogin(data: {
  email: string;
  password: string;
}): FormErrors {
  const errors: FormErrors = { ...emptyErrors };
  errors.email = validateEmail(data.email);
  errors.password = validatePassword(data.password);
  return errors;
}

/** Validates the registration form fields. */
export function validateRegister(data: {
  email: string;
  password: string;
  displayName: string;
}): FormErrors {
  const errors: FormErrors = { ...emptyErrors };
  errors.email = validateEmail(data.email);
  errors.password = validatePassword(data.password);
  errors.displayName = validateDisplayName(data.displayName);
  return errors;
}

/** Tells whether the form has at least one error. */
export function hasErrors(errors: FormErrors): boolean {
  return errors.email !== null || errors.password !== null || errors.displayName !== null;
}

/**
 * Password strength as the user types.
 * score: 0 (none) to 4 (very strong).
 */
export function passwordStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = [
    "Demasiado corta",
    "Débil",
    "Aceptable",
    "Buena",
    "Muy fuerte",
  ];

  return {
    score: Math.min(score, 4),
    label: labels[Math.min(score, 4)],
  };
}
