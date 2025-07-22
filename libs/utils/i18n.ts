// i18n.ts
// Simple translation utility for backend error messages

const translations: Record<string, string> = {
  'Internal server error': 'Error interno del servidor',
  'Conflict': 'Conflicto',
  'Bad request': 'Solicitud incorrecta',
  'Not found': 'No encontrado',
  'Usuario no encontrado': 'User not found',
  'Contraseña incorrecta': 'Wrong password',
  'El porcentaje no puede ser mayor que 100': 'El porcentaje no puede ser mayor que 100',
  // Add more translations as needed
};

export function translate(message: string, lang: string = 'es'): string {
  if (lang === 'es' && translations[message]) {
    return translations[message];
  }
  return message;
}
