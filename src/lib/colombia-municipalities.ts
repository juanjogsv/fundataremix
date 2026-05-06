// Coordenadas de municipios de Colombia por código DANE
// Fuente: DANE - Divipola
export const colombiaMunicipalities: Record<string, { lat: number; lng: number; name: string; department: string }> = {
  // Antioquia
  "05001": { lat: 6.2476, lng: -75.5658, name: "Medellín", department: "Antioquia" },
  "05045": { lat: 7.8791, lng: -76.6264, name: "Apartadó", department: "Antioquia" },
  "05120": { lat: 7.5830, lng: -75.3490, name: "Cáceres", department: "Antioquia" },
  "05490": { lat: 8.4266, lng: -76.7850, name: "Necoclí", department: "Antioquia" },
  "05495": { lat: 8.0930, lng: -74.7740, name: "Nechí", department: "Antioquia" },
  "05665": { lat: 8.2744, lng: -76.3827, name: "San Pedro de Urabá", department: "Antioquia" },
  "05837": { lat: 8.0900, lng: -76.7280, name: "Turbo", department: "Antioquia" },
  
  // Caldas
  "17001": { lat: 5.0689, lng: -75.5174, name: "Manizales", department: "Caldas" },
  "17013": { lat: 5.4010, lng: -75.4410, name: "Aguadas", department: "Caldas" },
  "17042": { lat: 5.2920, lng: -75.4890, name: "Anserma", department: "Caldas" },
  "17050": { lat: 5.1300, lng: -75.4260, name: "Aranzazu", department: "Caldas" },
  "17088": { lat: 5.4980, lng: -75.4180, name: "Belalcázar", department: "Caldas" },
  "17174": { lat: 5.0230, lng: -75.4460, name: "Chinchiná", department: "Caldas" },
  "17272": { lat: 5.2920, lng: -75.3970, name: "Filadelfia", department: "Caldas" },
  "17380": { lat: 5.4970, lng: -75.6250, name: "La Dorada", department: "Caldas" },
  "17433": { lat: 5.1520, lng: -75.3910, name: "Manzanares", department: "Caldas" },
  "17442": { lat: 5.0130, lng: -75.5940, name: "Marquetalia", department: "Caldas" },
  "17444": { lat: 5.1270, lng: -75.3410, name: "Marulanda", department: "Caldas" },
  "17446": { lat: 5.0040, lng: -75.5910, name: "Neira", department: "Caldas" },
  "17495": { lat: 4.8780, lng: -75.6380, name: "Norcasia", department: "Caldas" },
  "17513": { lat: 5.3300, lng: -75.4980, name: "Pácora", department: "Caldas" },
  "17524": { lat: 4.9330, lng: -75.5250, name: "Palestina", department: "Caldas" },
  "17541": { lat: 5.0440, lng: -75.6580, name: "Pensilvania", department: "Caldas" },
  "17614": { lat: 5.3100, lng: -75.5200, name: "Riosucio", department: "Caldas" },
  "17616": { lat: 5.4310, lng: -75.4080, name: "Risaralda", department: "Caldas" },
  "17653": { lat: 5.3920, lng: -75.5040, name: "Salamina", department: "Caldas" },
  "17662": { lat: 4.9050, lng: -75.5630, name: "Samaná", department: "Caldas" },
  "17665": { lat: 5.4480, lng: -75.5130, name: "San José", department: "Caldas" },
  "17777": { lat: 5.3730, lng: -75.5640, name: "Supía", department: "Caldas" },
  "17867": { lat: 4.8850, lng: -75.7700, name: "Victoria", department: "Caldas" },
  "17873": { lat: 5.0100, lng: -75.4240, name: "Villamaría", department: "Caldas" },
  "17877": { lat: 5.4660, lng: -75.4780, name: "Viterbo", department: "Caldas" },
  
  // Córdoba
  "23001": { lat: 8.7480, lng: -75.8810, name: "Montería", department: "Córdoba" },
  "23466": { lat: 7.9810, lng: -75.4240, name: "Montelíbano", department: "Córdoba" },
  "23580": { lat: 7.8970, lng: -75.6700, name: "Puerto Libertador", department: "Córdoba" },
  
  // Huila
  "41001": { lat: 2.9273, lng: -75.2819, name: "Neiva", department: "Huila" },
  "41013": { lat: 2.2510, lng: -75.7330, name: "Agrado", department: "Huila" },
  "41020": { lat: 2.5240, lng: -75.3170, name: "Algeciras", department: "Huila" },
  "41132": { lat: 2.6830, lng: -75.3210, name: "Campoalegre", department: "Huila" },
  "41298": { lat: 2.1970, lng: -75.6270, name: "Garzón", department: "Huila" },
  "41306": { lat: 2.3880, lng: -75.5480, name: "Gigante", department: "Huila" },
  "41349": { lat: 2.5890, lng: -75.4430, name: "Hobo", department: "Huila" },
  "41548": { lat: 2.2570, lng: -75.8050, name: "Pital", department: "Huila" },
  "41615": { lat: 2.7850, lng: -75.2610, name: "Rivera", department: "Huila" },
  
  // Nariño
  "52001": { lat: 1.2136, lng: -77.2811, name: "Pasto", department: "Nariño" },
  "52835": { lat: 1.7986, lng: -78.7644, name: "Tumaco", department: "Nariño" },
  
  // Bogotá
  "11001": { lat: 4.7110, lng: -74.0721, name: "Bogotá D.C.", department: "Bogotá D.C." },
  
  // Valle del Cauca
  "76001": { lat: 3.4516, lng: -76.5320, name: "Cali", department: "Valle del Cauca" },
  "76109": { lat: 3.8801, lng: -76.2961, name: "Buenaventura", department: "Valle del Cauca" },
  
  // Atlántico
  "08001": { lat: 10.9685, lng: -74.7813, name: "Barranquilla", department: "Atlántico" },
  
  // Bolívar
  "13001": { lat: 10.3910, lng: -75.4794, name: "Cartagena", department: "Bolívar" },
  
  // Santander
  "68001": { lat: 7.1254, lng: -73.1198, name: "Bucaramanga", department: "Santander" },
  
  // Risaralda
  "66001": { lat: 4.8133, lng: -75.6961, name: "Pereira", department: "Risaralda" },
  
  // Quindío
  "63001": { lat: 4.5339, lng: -75.6811, name: "Armenia", department: "Quindío" },
  
  // Tolima
  "73001": { lat: 4.4389, lng: -75.2322, name: "Ibagué", department: "Tolima" },
  
  // Meta
  "50001": { lat: 4.1420, lng: -73.6266, name: "Villavicencio", department: "Meta" },
  
  // Cesar
  "20001": { lat: 10.4769, lng: -73.2505, name: "Valledupar", department: "Cesar" },
  
  // Magdalena
  "47001": { lat: 11.2408, lng: -74.1990, name: "Santa Marta", department: "Magdalena" },
  
  // Cundinamarca (algunos municipios)
  "25001": { lat: 5.0268, lng: -73.9138, name: "Agua de Dios", department: "Cundinamarca" },
  "25126": { lat: 4.7292, lng: -74.3546, name: "Cajicá", department: "Cundinamarca" },
  "25175": { lat: 4.8657, lng: -74.0340, name: "Chía", department: "Cundinamarca" },
  "25286": { lat: 4.6860, lng: -74.2319, name: "Funza", department: "Cundinamarca" },
  "25430": { lat: 4.6973, lng: -74.2729, name: "Madrid", department: "Cundinamarca" },
  "25754": { lat: 4.5760, lng: -74.1890, name: "Soacha", department: "Cundinamarca" },
  "25899": { lat: 4.7978, lng: -74.0345, name: "Zipaquirá", department: "Cundinamarca" },
  
  // Norte de Santander
  "54001": { lat: 7.8939, lng: -72.5078, name: "Cúcuta", department: "Norte de Santander" },
  
  // Cauca
  "19001": { lat: 2.4419, lng: -76.6066, name: "Popayán", department: "Cauca" },
  
  // Boyacá
  "15001": { lat: 5.5353, lng: -73.3678, name: "Tunja", department: "Boyacá" },
  
  // Sucre
  "70001": { lat: 9.3047, lng: -75.3978, name: "Sincelejo", department: "Sucre" },
  
  // Departamentos (para códigos de 2 dígitos)
  "05": { lat: 6.2476, lng: -75.5658, name: "Antioquia", department: "Antioquia" },
  "08": { lat: 10.9685, lng: -74.7813, name: "Atlántico", department: "Atlántico" },
  "11": { lat: 4.7110, lng: -74.0721, name: "Bogotá D.C.", department: "Bogotá D.C." },
  "13": { lat: 10.3910, lng: -75.4794, name: "Bolívar", department: "Bolívar" },
  "15": { lat: 5.5353, lng: -73.3678, name: "Boyacá", department: "Boyacá" },
  "17": { lat: 5.0689, lng: -75.5174, name: "Caldas", department: "Caldas" },
  "19": { lat: 2.4419, lng: -76.6066, name: "Cauca", department: "Cauca" },
  "20": { lat: 10.4769, lng: -73.2505, name: "Cesar", department: "Cesar" },
  "23": { lat: 8.7480, lng: -75.8810, name: "Córdoba", department: "Córdoba" },
  "25": { lat: 4.7110, lng: -74.0721, name: "Cundinamarca", department: "Cundinamarca" },
  "41": { lat: 2.9273, lng: -75.2819, name: "Huila", department: "Huila" },
  "47": { lat: 11.2408, lng: -74.1990, name: "Magdalena", department: "Magdalena" },
  "50": { lat: 4.1420, lng: -73.6266, name: "Meta", department: "Meta" },
  "52": { lat: 1.2136, lng: -77.2811, name: "Nariño", department: "Nariño" },
  "54": { lat: 7.8939, lng: -72.5078, name: "Norte de Santander", department: "Norte de Santander" },
  "63": { lat: 4.5339, lng: -75.6811, name: "Quindío", department: "Quindío" },
  "66": { lat: 4.8133, lng: -75.6961, name: "Risaralda", department: "Risaralda" },
  "68": { lat: 7.1254, lng: -73.1198, name: "Santander", department: "Santander" },
  "70": { lat: 9.3047, lng: -75.3978, name: "Sucre", department: "Sucre" },
  "73": { lat: 4.4389, lng: -75.2322, name: "Tolima", department: "Tolima" },
  "76": { lat: 3.4516, lng: -76.5320, name: "Valle del Cauca", department: "Valle del Cauca" },
};

// Normaliza el código DANE (quita espacios y asegura formato correcto)
export function normalizeDaneCode(code: string | null): string | null {
  if (!code) return null;
  return code.trim().replace(/\s+/g, '');
}

// Obtiene coordenadas por código DANE
export function getCoordinatesByDaneCode(code: string | null): { lat: number; lng: number; name: string; department: string } | null {
  const normalizedCode = normalizeDaneCode(code);
  if (!normalizedCode) return null;
  return colombiaMunicipalities[normalizedCode] || null;
}
