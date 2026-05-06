/**
 * Normalizes city names to use consistent short forms.
 * Maps long official names to shorter display names.
 */
export const normalizeCityName = (name: string): string => {
  const nameMap: Record<string, string> = {
    'Cartagena de Indias': 'Cartagena',
    'San José de Cúcuta': 'Cúcuta',
  };
  
  return nameMap[name] || name;
};
