/**
 * Validaciones del formulario de iniciar sesión y crear cuenta.
 *
 * Se ejecutan en el navegador antes de llamar a la API: dan retroalimentación
 * inmediata sin viajes al servidor. El backend valida de nuevo con Zod, así que
 * estas reglas son una capa de experiencia de usuario, no de seguridad.
 */

export interface FieldError {
  field: "email" | "password" | "displayName";
  message: string;
}

/** Un correo válido debe contener exactamente una `@` con dominio a su derecha. */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim();

  if (!trimmed) return "El correo es obligatorio.";
  if (!trimmed.includes("@")) return "El correo debe incluir una @.";
  if (trimmed.indexOf("@") === 0) return "Falta el nombre de usuario antes de la @.";
  if (trimmed.indexOf("@") === trimmed.length - 1)
    return "Falta el dominio después de la @.";
  if (trimmed.split("@").length !== 2) return "El correo no puede llevar más de una @.";
  if (trimmed.length > 120) return "El correo es demasiado largo (máximo 120 caracteres).";

  return null;
}

/** Contraseña: entre 8 y 120 caracteres. */
export function validatePassword(password: string): string | null {
  if (!password) return "La contraseña es obligatoria.";
  if (password.length < 8)
    return "La contraseña debe tener al menos 8 caracteres.";
  if (password.length > 120)
    return "La contraseña es demasiado larga (máximo 120 caracteres).";

  return null;
}

/** Nombre a mostrar: entre 2 y 40 caracteres. */
export function validateDisplayName(displayName: string): string | null {
  const trimmed = displayName.trim();

  if (!trimmed) return "El nombre a mostrar es obligatorio.";
  if (trimmed.length < 2) return "El nombre es demasiado corto (mínimo 2 caracteres).";
  if (trimmed.length > 40) return "El nombre es demasiado largo (máximo 40 caracteres).";

  return null;
}

/** Resultado de validar un formulario: campo → mensaje de error o null. */
export interface FormErrors {
  email: string | null;
  password: string | null;
  displayName: string | null;
}

const emptyErrors: FormErrors = { email: null, password: null, displayName: null };

/** Valida los campos del formulario de iniciar sesión. */
export function validateLogin(data: {
  email: string;
  password: string;
}): FormErrors {
  const errors: FormErrors = { ...emptyErrors };
  errors.email = validateEmail(data.email);
  errors.password = validatePassword(data.password);
  return errors;
}

/** Valida los campos del formulario de crear cuenta. */
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

/** Dice si hay al menos un error en el formulario. */
export function hasErrors(errors: FormErrors): boolean {
  return errors.email !== null || errors.password !== null || errors.displayName !== null;
}

/**
 * Fuerza de la contraseña mientras el usuario escribe.
 * score: 0 (ninguna) a 4 (muy fuerte).
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
