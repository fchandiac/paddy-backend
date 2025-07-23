// i18n.ts
// Simple translation utility for backend error messages

const translations: Record<string, string> = {
  'Internal server error': 'Error interno del servidor',
  'Conflict': 'Conflicto',
  'Bad request': 'Solicitud incorrecta',
  'Not found': 'No encontrado',
  'User not found': 'Usuario no encontrado',
  'Wrong password': 'Contraseña incorrecta',
  'The percentage cannot be greater than 100': 'El porcentaje no puede ser mayor que 100',
  // Agrega más traducciones según sea necesario
};

export function translate(message: string, lang: string = 'es'): string {
  if (lang === 'es' && translations[message]) {
    return translations[message];
  }
  return message;
}
