/**
 * Elimina etiquetas HTML peligrosas e intentos de inyección básicos en texto plano.
 * Útil para Nombres, Direcciones, Especialidades, etc.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  
  const originalValue = input.toString();

  // 1. Detectar bloques completos de script y style
  const hasScriptOrStyle = /<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi.test(originalValue);
  
  // 2. Detectar etiquetas HTML generales
  const hasHtmlTags = /<[^>]*>/g.test(originalValue);
  
  // 3. Detectar atributos maliciosos o pseudoprotocolos
  const hasMaliciousAttributes = /on\w+="[^"]*"/gi.test(originalValue) || /on\w+='[^']*'/gi.test(originalValue) || /on\w+=\w+/gi.test(originalValue);
  const hasJsProtocol = /javascript:/gi.test(originalValue);

  if (hasScriptOrStyle || hasHtmlTags || hasMaliciousAttributes || hasJsProtocol) {
    throw new Error("Se han detectado caracteres no permitidos (HTML/Scripts) en los campos de texto.");
  }

  // Si pasa todas las pruebas de seguridad, retornamos sin espacios basura
  return originalValue.trim();
}

/**
 * Sanitiza y normaliza correos electrónicos.
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (!input) return "";
  
  let cleanValue = input.toString().trim().toLowerCase();
  
  // Detectar formato de correo válido básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanValue)) {
    throw new Error("El formato del correo electrónico proporcionado es inválido.");
  }
  
  return cleanValue;
}

/**
 * Normaliza números de teléfono (Mantiene solo los dígitos numéricos).
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (!input) return "";
  
  // Mantiene solo dígitos y un signo + inicial
  const cleanValue = input.toString().replace(/(?!^\+)[^\d]/g, "").trim();

  // Verificar que tenga al menos dígitos plausibles para un teléfono (10 min)
  if (cleanValue.replace(/[^\d]/g, "").length < 10) {
     throw new Error("El teléfono debe contener al menos 10 dígitos numéricos.");
  }

  return cleanValue;
}

/**
 * Sanitiza valores estrictamente alfanuméricos (ideal para Matrículas).
 */
export function sanitizeAlphanumeric(input: string | null | undefined): string {
  if (!input) return "";
  
  // Remueve absolutamente cualquier cosa que no sea letra o número
  return input.toString().replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();
}
