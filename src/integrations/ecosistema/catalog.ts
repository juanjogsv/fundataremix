// Static snapshot of the DAMA indicator catalog.
// The Ecosistema project's catalogo_indicadores table is not readable by the anon role,
// so we ship the reference metadata alongside the client.
// Source: internal dama_catalog table (sync'ed once).

export interface CatalogEntry {
  cod_indicador: string;
  indicador: string;
  dimension: string;
  seccion: string;
  unidad_medida: string;
  fuente: string;
  periodicidad: string;
}

export const CATALOG: CatalogEntry[] = [
  {
    "cod_indicador": "ATAL_01",
    "indicador": "Estudiantes que alcanzan el nivel estándar o avanzado - entrada",
    "dimension": "Educación",
    "seccion": "Aprendamos todos a leer",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Aplicación pruebas EGRA - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ATAL_02",
    "indicador": "Estudiantes que alcanzan el nivel estándar o avanzado - salida",
    "dimension": "Educación",
    "seccion": "Aprendamos todos a leer",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Aplicación pruebas EGRA - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ATAL_03",
    "indicador": "Prueba de entrada palabras leídas por minuto",
    "dimension": "Educación",
    "seccion": "Aprendamos todos a leer",
    "unidad_medida": "Puntaje",
    "fuente": "Aplicación pruebas EGRA - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ATAL_04",
    "indicador": "Prueba de salida palabras leídas por minuto",
    "dimension": "Educación",
    "seccion": "Aprendamos todos a leer",
    "unidad_medida": "Puntaje",
    "fuente": "Aplicación pruebas EGRA - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_01",
    "indicador": "Tasa de cobertura neta en media",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_02",
    "indicador": "Tasa de cobertura neta en preescolar",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_03",
    "indicador": "Tasa de cobertura neta en primaria",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_04",
    "indicador": "Tasa de cobertura neta en secundaria",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_05",
    "indicador": "Tasa de deserción escolar",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "COBE_06",
    "indicador": "Tasa de tránsito inmediato a educación superior",
    "dimension": "Educación",
    "seccion": "Cobertura educativa",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CSOC_01",
    "indicador": "Porcentaje de estudiantes en proceso - trabajo en equipo",
    "dimension": "Educación",
    "seccion": "Competencias socioemocionales",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Aplicación pruebas socioemocionales - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CSOC_02",
    "indicador": "Porcentaje de estudiantes en riesgo - trabajo en equipo",
    "dimension": "Educación",
    "seccion": "Competencias socioemocionales",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Aplicación pruebas socioemocionales - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CSOC_03",
    "indicador": "Porcentaje de estudiantes prosperando - trabajo en equipo",
    "dimension": "Educación",
    "seccion": "Competencias socioemocionales",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Aplicación pruebas socioemocionales - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CV_01",
    "indicador": "Coeficiente de Gini de ingresos",
    "dimension": "Contexto socioeconómico",
    "seccion": "Condiciones de vida",
    "unidad_medida": "Puntaje",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CV_02",
    "indicador": "Incidencia de pobreza monetaria",
    "dimension": "Contexto socioeconómico",
    "seccion": "Condiciones de vida",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CV_03",
    "indicador": "Incidencia de pobreza monetaria extrema",
    "dimension": "Contexto socioeconómico",
    "seccion": "Condiciones de vida",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CV_04",
    "indicador": "Porcentaje de nacidos vivos con bajo peso al nacer",
    "dimension": "Contexto socioeconómico",
    "seccion": "Condiciones de vida",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Salud y Protección Social",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "CV_05",
    "indicador": "Tasa de suicidios (por cada 100.000 habitantes)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Condiciones de vida",
    "unidad_medida": "Tasa",
    "fuente": "Ministerio de Defensa",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ECO_01",
    "indicador": "Crecimiento del valor agregado",
    "dimension": "Contexto socioeconómico",
    "seccion": "Economía",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Cuentas nacionales",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ECO_02",
    "indicador": "Valor agregado municipal",
    "dimension": "Contexto socioeconómico",
    "seccion": "Economía",
    "unidad_medida": "Miles de millones de pesos",
    "fuente": "DANE - Cuentas nacionales",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "GP_01",
    "indicador": "Inversión del proyecto",
    "dimension": "Gestión de proyectos",
    "seccion": "Inversión",
    "unidad_medida": "Pesos corrientes",
    "fuente": "Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "GP_02",
    "indicador": "Número de beneficiarios",
    "dimension": "Gestión de proyectos",
    "seccion": "Beneficiarios",
    "unidad_medida": "Total Beneficiarios",
    "fuente": "Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "GP_03",
    "indicador": "Número de instituciones beneficiarias",
    "dimension": "Gestión de proyectos",
    "seccion": "Beneficiarios",
    "unidad_medida": "N° de colegios",
    "fuente": "Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_01",
    "indicador": "Fuerza de trabajo juvenil",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_02",
    "indicador": "Condición de actividad de egresados",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Seguimiento a egresados - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_03",
    "indicador": "Población desocupada juvenil",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_04",
    "indicador": "Población en edad de trabajar (PET) de 15 a 28 años",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_05",
    "indicador": "Población fuera de la fuerza de trabajo juvenil",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_06",
    "indicador": "Población ocupada juvenil",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_07",
    "indicador": "Tasa de desocupación juvenil (TD)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_08",
    "indicador": "Tasa de ocupación juvenil (TO)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_09",
    "indicador": "Tasa global de participación juvenil (TGP)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_10",
    "indicador": "Porcentaje de jóvenes que no estudian ni trabajan (18-28 años)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "MLJ_11",
    "indicador": "Número de jóvenes que no estudian ni trabajan (18-28 años)",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral juvenil",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ML_01",
    "indicador": "Población ocupada",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral",
    "unidad_medida": "Personas",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ML_02",
    "indicador": "Tasa de desempleo",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ML_03",
    "indicador": "Tasa de desempleo en mujeres",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "ML_04",
    "indicador": "Tasa de informalidad",
    "dimension": "Contexto socioeconómico",
    "seccion": "Mercado laboral",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Gran Encuesta Integrada de Hogares (GEIH)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "POB_01",
    "indicador": "Población total",
    "dimension": "Contexto socioeconómico",
    "seccion": "Población",
    "unidad_medida": "Personas",
    "fuente": "DANE - Proyecciones de población",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "POB_02",
    "indicador": "Porcentaje de población de 65 años o más",
    "dimension": "Contexto socioeconómico",
    "seccion": "Población",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "DANE - Proyecciones de población",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_01",
    "indicador": "Puntaje en ciencias naturales",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_02",
    "indicador": "Puntaje global",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_03",
    "indicador": "Puntaje en inglés",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_04",
    "indicador": "Puntaje en lectura crítica",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_05",
    "indicador": "Puntaje en matemáticas",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_06",
    "indicador": "Puntaje en sociales y ciudadanas",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Puntaje",
    "fuente": "Instituto Colombiano para la Evaluación de la Educación (ICFES)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "SABER_07",
    "indicador": "Porcentaje de planteles con nivel A y A+ en pruebas Saber 11",
    "dimension": "Educación",
    "seccion": "Resultados pruebas Saber 11",
    "unidad_medida": "Porcentaje (el valor está multiplicado por 100)",
    "fuente": "Ministerio de Educación Nacional (MEN)",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "UTC_01",
    "indicador": "Matrícula técnica por habitante",
    "dimension": "Educación",
    "seccion": "Matrícula técnica UTC",
    "unidad_medida": "Tasa x 1000 habitantes",
    "fuente": "Registros administrativos - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "UTC_02",
    "indicador": "Matrícula técnica UTC por institución educativa",
    "dimension": "Educación",
    "seccion": "Matrícula técnica UTC",
    "unidad_medida": "Puntaje",
    "fuente": "Registros administrativos - Fundación Luker",
    "periodicidad": "Anual"
  },
  {
    "cod_indicador": "UTC_03",
    "indicador": "Matrícula técnica UTC por programa",
    "dimension": "Educación",
    "seccion": "Matrícula técnica UTC",
    "unidad_medida": "Puntaje",
    "fuente": "Registros administrativos - Fundación Luker",
    "periodicidad": "Anual"
  }
];

export const CATALOG_BY_CODE: Record<string, CatalogEntry> = Object.fromEntries(CATALOG.map(c => [c.cod_indicador, c]));
