import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error('Unauthorized - Admin access required');
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const moduleId = formData.get('moduleId') as string;

    if (!file || !moduleId) {
      throw new Error('Missing file or moduleId');
    }

    console.log(`Processing upload for module: ${moduleId}, file: ${file.name}`);

    // Process based on module type
    if (moduleId === 'documentos') {
      // Handle ZIP file for documents
      return await handleDocumentsUpload(supabaseClient, file);
    } else {
      // Handle Excel files for other modules
      return await handleExcelUpload(supabaseClient, file, moduleId);
    }

  } catch (error: any) {
    console.error('Error processing upload:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to sanitize filenames for storage
function sanitizeFileName(fileName: string): string {
  return fileName
    // Remove accents/diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove any character that's not alphanumeric, underscore, dash, or dot
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    // Remove multiple consecutive underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, '');
}

async function handleDocumentsUpload(supabaseClient: any, file: File) {
  console.log(`Processing documents ZIP: ${file.name}`);
  
  // Import JSZip for Deno
  const JSZip = (await import('https://esm.sh/jszip@3.10.1')).default;
  
  // Extract folder name from ZIP filename (remove .zip extension)
  const originalFolderName = file.name.replace(/\.zip$/i, '');
  const folderName = sanitizeFileName(originalFolderName);
  
  // Check if category already exists (use original name for display)
  const { data: existingCategory } = await supabaseClient
    .from('document_categories')
    .select('id')
    .eq('name', originalFolderName)
    .maybeSingle();
  
  let categoryId: string;
  
  if (existingCategory) {
    // Category exists - delete old documents and files
    categoryId = existingCategory.id;
    console.log(`Updating existing category: ${originalFolderName}`);
    
    // Get all documents in this category to delete their files
    const { data: oldDocs } = await supabaseClient
      .from('documents')
      .select('file_path')
      .eq('category_id', categoryId);
    
    // Delete files from storage
    if (oldDocs && oldDocs.length > 0) {
      const filePaths = oldDocs.map((doc: any) => doc.file_path);
      await supabaseClient.storage
        .from('documents')
        .remove(filePaths);
      console.log(`Deleted ${filePaths.length} old files from storage`);
    }
    
    // Delete document records
    await supabaseClient
      .from('documents')
      .delete()
      .eq('category_id', categoryId);
  } else {
    // Create new category (use original name for display)
    console.log(`Creating new category: ${originalFolderName}`);
    const { data: newCategory, error: categoryError } = await supabaseClient
      .from('document_categories')
      .insert({ name: originalFolderName })
      .select()
      .single();
    
    if (categoryError) {
      throw new Error(`Failed to create category: ${categoryError.message}`);
    }
    
    categoryId = newCategory.id;
  }
  
  // Read and extract ZIP file
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Collect all file entries to process
  const fileEntries: Array<[string, any]> = [];
  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    // Skip directories and hidden files
    if (zipEntry.dir || relativePath.startsWith('__MACOSX') || relativePath.startsWith('.')) {
      continue;
    }
    fileEntries.push([relativePath, zipEntry]);
  }
  
  console.log(`Found ${fileEntries.length} files to process`);
  
  // Process files in batches to avoid memory issues
  const BATCH_SIZE = 5;
  const documentsToInsert = [];
  let processedCount = 0;
  
  for (let i = 0; i < fileEntries.length; i += BATCH_SIZE) {
    const batch = fileEntries.slice(i, i + BATCH_SIZE);
    const batchPromises = [];
    const batchDocuments = [];
    
    for (const [relativePath, zipEntry] of batch) {
      // Get file content as blob
      const content = await zipEntry.async('blob');
      const originalFileName = relativePath.split('/').pop() || relativePath;
      
      // Skip if no valid filename
      if (!originalFileName) continue;
      
      // Sanitize filename for storage path
      const sanitizedFileName = sanitizeFileName(originalFileName);
      
      // Create storage path with sanitized names
      const storagePath = `${folderName}/${sanitizedFileName}`;
      
      // Upload to storage
      const uploadPromise = supabaseClient.storage
        .from('documents')
        .upload(storagePath, content, {
          contentType: content.type || 'application/octet-stream',
          upsert: true
        });
      
      batchPromises.push(uploadPromise);
      
      // Prepare document record (use original name for display)
      batchDocuments.push({
        name: originalFileName,
        file_path: storagePath,
        file_type: originalFileName.split('.').pop()?.toLowerCase() || 'unknown',
        file_size: content.size,
        category_id: categoryId
      });
    }
    
    // Wait for batch uploads to complete
    const uploadResults = await Promise.all(batchPromises);
    
    // Check for upload errors in this batch
    const uploadErrors = uploadResults.filter(result => result.error);
    if (uploadErrors.length > 0) {
      console.error('Some uploads failed in batch:', uploadErrors);
      throw new Error(`Failed to upload ${uploadErrors.length} files`);
    }
    
    // Add successful documents to insert list
    documentsToInsert.push(...batchDocuments);
    processedCount += batch.length;
    
    console.log(`Processed ${processedCount}/${fileEntries.length} files`);
  }
  
  // Insert all document records at once
  if (documentsToInsert.length > 0) {
    const { error: insertError } = await supabaseClient
      .from('documents')
      .insert(documentsToInsert);
    
    if (insertError) {
      throw new Error(`Failed to insert documents: ${insertError.message}`);
    }
    
    console.log(`Inserted ${documentsToInsert.length} document records`);
  }
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: `Carpeta "${originalFolderName}" cargada con ${documentsToInsert.length} documentos`,
      categoryId,
      documentsCount: documentsToInsert.length
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleExcelUpload(supabaseClient: any, file: File, moduleId: string) {
  // Read file as array buffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Import XLSX library (Deno-compatible)
  const XLSX = await import('https://esm.sh/xlsx@0.18.5');
  
  // Parse Excel file
  const workbook = XLSX.read(uint8Array, { type: 'array' });
  
  let worksheet;
  let sheetName;
  
  // For education module, try to find the right sheet
  if (moduleId === 'educacion') {
    // Try to find the right sheet based on file name
    if (file.name.toLowerCase().includes('beneficiario')) {
      // For beneficiaries: look for sheet with Programa, Departamento, Valor columns
      for (const name of workbook.SheetNames) {
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (jsonData.length > 0) {
          const firstRow: any = jsonData[0];
          if ('Programa' in firstRow && 'Departamento' in firstRow && 'Valor' in firstRow) {
            worksheet = sheet;
            sheetName = name;
            console.log(`Found beneficiaries sheet: ${name}`);
            break;
          }
        }
      }
    } else {
      // For indicators: look for "Base" sheet or sheet with indicador, sección, dato columns
      // First try to find "Base" sheet
      if (workbook.SheetNames.includes('Base')) {
        sheetName = 'Base';
        worksheet = workbook.Sheets[sheetName];
        console.log(`Found Base sheet for education indicators`);
      } else {
        // Otherwise, look for sheet with expected columns
        for (const name of workbook.SheetNames) {
          const sheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
          if (jsonData.length > 0) {
            const firstRow: any = jsonData[0];
            // Check if it has the indicators structure
            if (('indicador' in firstRow || 'Indicador' in firstRow) && 
                ('sección' in firstRow || 'Sección' in firstRow || 'seccion' in firstRow) &&
                ('dato' in firstRow || 'Dato' in firstRow)) {
              worksheet = sheet;
              sheetName = name;
              console.log(`Found education indicators sheet: ${name}`);
              break;
            }
          }
        }
      }
    }
    
    // If not found, use first sheet as fallback
    if (!worksheet) {
      sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
      console.log(`Using first sheet as fallback: ${sheetName}`);
    }
  } else if (moduleId === 'desarrollo_rural' || moduleId === 'cacao' || moduleId === 'especiales') {
    // For rural development/cacao/special projects module, look for "Base" sheet specifically
    if (workbook.SheetNames.includes('Base')) {
      sheetName = 'Base';
      worksheet = workbook.Sheets[sheetName];
      console.log(`Found Base sheet for ${moduleId} data`);
    } else {
      // Otherwise look for sheet with expected columns (sección, indicador, dato)
      for (const name of workbook.SheetNames) {
        if (name.toLowerCase() === 'metadatos') continue; // Skip metadata sheet
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (jsonData.length > 0) {
          const firstRow: any = jsonData[0];
          if (('sección' in firstRow || 'seccion' in firstRow) && 
              ('indicador' in firstRow || 'Indicador' in firstRow) &&
              ('dato' in firstRow || 'Dato' in firstRow)) {
            worksheet = sheet;
            sheetName = name;
            console.log(`Found rural development indicators sheet: ${name}`);
            break;
          }
        }
      }
    }
    
    if (!worksheet) {
      // Fallback - find first non-metadata sheet with data
      for (const name of workbook.SheetNames) {
        if (name.toLowerCase() === 'metadatos') continue;
        const sheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (jsonData.length > 0) {
          sheetName = name;
          worksheet = sheet;
          console.log(`Using fallback sheet: ${name}`);
          break;
        }
      }
    }
  } else {
    // For other modules, look for the first non-empty sheet with data
    let foundSheet = false;
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      // Skip if sheet is empty or has no data rows
      if (jsonData.length > 0) {
        const hasValidData = jsonData.some((row: any) => 
          Object.values(row).some(val => val !== null && val !== undefined && val !== '')
        );
        if (hasValidData) {
          sheetName = name;
          worksheet = sheet;
          foundSheet = true;
          console.log(`Using sheet: ${name} with ${jsonData.length} rows`);
          break;
        }
      }
    }
    
    if (!foundSheet) {
      // Fallback to first sheet
      sheetName = workbook.SheetNames[0];
      worksheet = workbook.Sheets[sheetName];
      console.log(`No valid sheet found, using first sheet as fallback: ${sheetName}`);
    }
  }
  
  // Final check to ensure we have a worksheet
  if (!worksheet) {
    throw new Error('No se pudo encontrar una hoja válida en el archivo Excel');
  }
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Parsed ${jsonData.length} rows from Excel sheet "${sheetName}" for module: ${moduleId}`);

  // Process based on module
  switch (moduleId) {
    case 'indicadores':
      // For strategic indicators, we need special handling for files with merged header rows
      // Try to parse with header row = 1 (second row) if columns look wrong
      let indicadoresData: any[] = jsonData as any[];
      const firstRowCols = indicadoresData.length > 0 ? Object.keys(indicadoresData[0] as object) : [];
      const hasProperColumns = firstRowCols.some(col => 
        col === 'Indicador' || col === 'Area' || col === 'Área' || col === 'PALABRA CLAVE'
      );
      
      if (!hasProperColumns) {
        // Try parsing with second row as header
        console.log('Column names not found in first row, trying with header row = 1');
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        // Find the row that contains "Indicador" column
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rawData.length, 5); i++) {
          const row = rawData[i];
          if (row && row.some((cell: any) => String(cell).includes('Indicador'))) {
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex >= 0) {
          const headers = rawData[headerRowIndex] as string[];
          console.log('Found headers at row', headerRowIndex, ':', headers);
          
          // Convert remaining rows to objects using these headers
          // Also include columns without headers as __EMPTY_X
          indicadoresData = [];
          let emptyCount = 0;
          for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row) continue;
            
            const obj: any = {};
            emptyCount = 0;
            headers.forEach((header: string, idx: number) => {
              if (header && String(header).trim()) {
                obj[String(header).trim()] = row[idx];
              } else {
                // For columns without header, use __EMPTY_X naming to match XLSX default behavior
                const emptyKey = emptyCount === 0 ? '__EMPTY' : `__EMPTY_${emptyCount}`;
                obj[emptyKey] = row[idx];
                emptyCount++;
              }
            });
            
            // Also include any extra columns beyond the header row
            for (let idx = headers.length; idx < row.length; idx++) {
              const emptyKey = emptyCount === 0 ? '__EMPTY' : `__EMPTY_${emptyCount}`;
              obj[emptyKey] = row[idx];
              emptyCount++;
            }
            
            indicadoresData.push(obj);
          }
          console.log('Re-parsed with correct headers, got', indicadoresData.length, 'rows');
          if (indicadoresData.length > 0) {
            console.log('Sample row keys:', Object.keys(indicadoresData[0]));
            console.log('Sample row values:', indicadoresData[0]);
          }
        }
      }
      
      return await processIndicadores(supabaseClient, indicadoresData, file.name);
    case 'calendario':
      return await processCalendario(supabaseClient, jsonData);
    case 'financiero':
      return await processFinanciero(supabaseClient, jsonData);
    case 'educacion':
      // Detect if it's beneficiaries or indicators based on filename or columns
      const firstRow: any = jsonData.length > 0 ? jsonData[0] : {};
      if (file.name.toLowerCase().includes('beneficiario') || 
          ('Programa' in firstRow && ('Beneficiarios' in firstRow || 'Valor' in firstRow))) {
        return await processEducationBeneficiaries(supabaseClient, jsonData);
      } else {
        return await processEducationIndicators(supabaseClient, jsonData);
      }
    case 'emprendimiento':
    case 'contexto':
      return await processAreaIndicators(supabaseClient, jsonData, moduleId);
    case 'especiales':
      return await processSpecialProjects(supabaseClient, jsonData);
    case 'desarrollo_rural':
    case 'cacao':
      return await processRuralDevelopment(supabaseClient, jsonData);
    case 'beneficiarios_rural':
      return await processRuralBeneficiaries(supabaseClient, jsonData);
    case 'georreferenciacion':
      return await processGeorreferenciacion(supabaseClient, jsonData);
    case 'inversion_historica':
      return await processSocialInvestmentHistorical(supabaseClient, jsonData, worksheet);
    default:
      throw new Error(`Unknown module: ${moduleId}`);
  }
}

async function processIndicadores(supabaseClient: any, data: any[], fileName?: string) {
  // Log column names to help debugging
  if (data.length > 0) {
    console.log('Excel columns found:', Object.keys(data[0]));
  }

  // Auto-detect year from filename first, then from column names
  let dataYear: number | undefined;
  
  // Try to extract year from filename (e.g., "Tablero_2023_con_corte.xlsx")
  if (fileName) {
    const fileYearMatch = fileName.match(/20(2[0-9])/);
    if (fileYearMatch) {
      dataYear = parseInt(fileYearMatch[0]);
      console.log(`Auto-detected year ${dataYear} from filename: ${fileName}`);
    }
  }
  
  // If not found in filename, check column names
  if (!dataYear && data.length > 0) {
    const columns = Object.keys(data[0]);
    if (columns.some(col => col.includes('2024') || col.includes('Avance anual 2024'))) {
      dataYear = 2024;
      console.log('Auto-detected year 2024 from column names');
    } else if (columns.some(col => col.includes('2023') || col.includes('Avance anual 2023'))) {
      dataYear = 2023;
      console.log('Auto-detected year 2023 from column names');
    } else if (columns.some(col => col.includes('2022') || col.includes('Avance anual 2022'))) {
      dataYear = 2022;
      console.log('Auto-detected year 2022 from column names');
    }
  }
  
  // Fallback to 2025 if still not detected
  if (!dataYear) {
    dataYear = 2025;
    console.log('No year detected, defaulting to 2025');
  }
  
  console.log(`Processing indicators for year: ${dataYear}`);

  // Delete existing data for this year only
  await supabaseClient.from('strategic_indicators').delete().eq('year', dataYear);

  // Insert new data with flexible column mapping
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Valid areas for the enum
  const validAreas = ['Educación', 'Emprendimiento', 'Desarrollo rural', 'Proyectos especiales', 'Estrategia', 'Comunicaciones'];
  
  const indicators = data
    .filter((row: any) => {
      // Filter out empty rows
      const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '');
      if (!hasData) return false;
      
      // Filter out summary/total rows that have numeric values in area column
      const areaValue = row['Area'] || row['Área'] || row['area'];
      if (areaValue !== undefined && areaValue !== null) {
        // If area is a number, it's a summary row - skip it
        if (typeof areaValue === 'number') {
          console.log('Skipping summary row with numeric area:', areaValue);
          return false;
        }
        // Check if it's a valid area
        const areaStr = String(areaValue).trim();
        if (!validAreas.includes(areaStr)) {
          console.log('Skipping row with invalid area:', areaStr);
          return false;
        }
      }
      
      return true;
    })
    .map((row: any) => {
      // Year-specific column mapping
      // Based on actual Excel column structure as they appear in parsed data
      
      let annual_goal, accumulated_value, accumulated_percentage;
      
      if (dataYear === 2024) {
        // 2024 file: "Avance anual 2024" appears in column G (Meta), H=Valor, I=%
        annual_goal = parseNumeric(
          row['Avance anual 2024'] ?? // Column G = Meta año
          row['Meta año'] ??
          0
        );
        accumulated_value = parseNumeric(
          row['__EMPTY'] ?? // Column H = Valor acumulado
          row['Valor acumulado'] ??
          0
        );
        accumulated_percentage = parseNumeric(
          row['__EMPTY_1'] ?? // Column I = % acumulado
          row['% acumulado'] ??
          0
        );
      } else if (dataYear === 2023) {
        // 2023 file: Column I = Meta, J = Valor (__EMPTY_2), K = % (__EMPTY_3)
        annual_goal = parseNumeric(
          row['Avance anual 2023'] ?? // Column I = Meta año
          row['Meta año'] ??
          0
        );
        accumulated_value = parseNumeric(
          row['__EMPTY_2'] ?? // Column J = Valor acumulado (no header, appears as __EMPTY_2)
          row['Valor acumulado'] ??
          0
        );
        accumulated_percentage = parseNumeric(
          row['__EMPTY_3'] ?? // Column K = % acumulado (no header, appears as __EMPTY_3)
          row['% acumulado'] ??
          0
        );
      } else {
        // 2025 file: "Avance anual 2025" appears in column F (Meta), G=Valor, H=%
        annual_goal = parseNumeric(
          row['Avance anual 2025'] ?? // Column F = Meta año
          row['Meta año'] ??
          row['Meta 2025'] ??
          0
        );
        accumulated_value = parseNumeric(
          row['__EMPTY'] ?? // Column G = Valor acumulado
          row['Valor acumulado'] ??
          row['Acumulado'] ??
          0
        );
        accumulated_percentage = parseNumeric(
          row['__EMPTY_1'] ?? // Column H = % acumulado
          row['% acumulado'] ??
          row['% Acumulado'] ??
          0
        );
      }

      const indicator = {
        indicator_name: row['Indicador'] || row['indicador'] || row['Nombre'] || row['nombre'] || row['indicator_name'] || '',
        area: row['Area'] || row['Área'] || row['area'] || 'Educación',
        keyword: row['PALABRA CLAVE'] || row['Keyword'] || row['keyword'] || row['Palabra clave'] || null,
        unit: row['Unidad'] || row['unidad'] || row['unit'] || 'Unidades',
        year: dataYear,
        annual_goal,
        accumulated_value,
        accumulated_percentage,
        // Logros históricos
        achievement_2023: parseNumeric(
          row['Logro 2023'] ??
          row['__EMPTY_2'] ??
          row['logro_2023'] ??
          row['2023'] ??
          0
        ),
        achievement_2024: parseNumeric(
          row['Logro 2024'] ??
          row['__EMPTY_3'] ??
          row['logro_2024'] ??
          row['2024'] ??
          0
        ),
      };
      
      console.log('Mapped indicator:', indicator);
      return indicator;
    })
    .filter((indicator: any) => indicator.indicator_name && indicator.indicator_name.trim() !== '');

  if (indicators.length === 0) {
    throw new Error('No se encontraron datos válidos en el archivo Excel. Verifica que las columnas sean correctas.');
  }

  const { error } = await supabaseClient.from('strategic_indicators').insert(indicators);
  
  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${indicators.length} indicadores actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processCalendario(supabaseClient: any, data: any[]) {
  // Log columns for debugging
  if (data.length > 0) {
    console.log('Calendar Excel columns found:', Object.keys(data[0]));
    console.log('Sample rows:', data.slice(0, 3));
  }

  // Delete existing data
  await supabaseClient.from('calendar_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Helper function to parse Excel serial date number
  const parseExcelDate = (value: any): string | null => {
    if (!value) return null;
    
    // If it's an Excel serial number (numeric)
    if (typeof value === 'number') {
      // Excel date serial number conversion (Excel epoch is Dec 30, 1899)
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
      return date.toISOString();
    }
    
    // If it's a string, try to parse it
    if (typeof value === 'string') {
      // Handle format like "Jan-29" - assume current year
      const monthMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const match = value.match(/^([A-Za-z]{3})-(\d{1,2})$/);
      if (match) {
        const month = monthMap[match[1]];
        const day = parseInt(match[2]);
        const year = new Date().getFullYear();
        if (month !== undefined && !isNaN(day)) {
          return new Date(year, month, day).toISOString();
        }
      }
      
      // Try standard date parsing
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }
    
    return null;
  };

  // Helper function to parse Excel time (decimal to time string)
  const parseExcelTime = (value: any): string | null => {
    if (!value) return null;
    
    // If it's a string, return as-is
    if (typeof value === 'string') {
      return value;
    }
    
    // If it's a decimal (Excel time format), convert to HH:MM AM/PM
    if (typeof value === 'number' && value >= 0 && value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      let hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }
    
    return String(value);
  };

  // Detect if columns are using __EMPTY pattern (Excel with merged header cells)
  const firstRow = data[0];
  const columns = Object.keys(firstRow || {});
  const hasEmptyColumns = columns.some(col => col.startsWith('__EMPTY'));
  
  // Skip header row if it contains "Fecha" as a value (meaning first row is the real header)
  let dataToProcess = data;
  if (hasEmptyColumns && data.length > 0) {
    const firstRowValues = Object.values(data[0]);
    if (firstRowValues.includes('Fecha') || firstRowValues.includes('Título')) {
      // Skip the first row which contains actual headers
      dataToProcess = data.slice(1);
      console.log('Skipping header row, processing', dataToProcess.length, 'data rows');
    }
  }

  // Insert new data - flexible column mapping for user's structure
  const events = dataToProcess
    .filter((row: any) => {
      // Filter out empty rows
      const values = Object.values(row);
      return values.some(v => v !== null && v !== undefined && v !== '');
    })
    .map((row: any) => {
      // Handle both standard column names and __EMPTY pattern
      let fecha, titulo, descripcion, lugar, hora;
      
      if (hasEmptyColumns) {
        // Excel with __EMPTY columns pattern
        fecha = row['__EMPTY'];
        titulo = row['__EMPTY_1'];
        descripcion = row['__EMPTY_2'];
        // The "Lugar" column has a weird name from the merged header
        lugar = row['Fecha del Evento: (Date) para ordenar cronológicamente.'] || row['__EMPTY_3'];
        hora = row['__EMPTY_3'] || row['__EMPTY_4'];
        
        // If lugar got the hora value (decimal), swap them
        if (typeof lugar === 'number' && lugar < 1) {
          hora = lugar;
          lugar = null;
        }
      } else {
        // Standard column names
        fecha = row['Fecha'] || row['fecha'] || row['Fecha del Evento'] || row['Fecha inicio'] || row['start_date'];
        titulo = row['Título'] || row['titulo'] || row['title'];
        descripcion = row['Descripción'] || row['descripcion'] || row['description'];
        lugar = row['Lugar'] || row['lugar'] || row['Link'];
        hora = row['Hora'] || row['hora'];
      }
      
      const startDate = parseExcelDate(fecha);
      const horaStr = parseExcelTime(hora);
      
      console.log(`Event: ${titulo}, Date value: ${fecha}, Parsed: ${startDate}, Time: ${horaStr}`);
      
      return {
        title: titulo || null,
        description: descripcion || null,
        start_date: startDate,
        end_date: startDate,
        color: '#00A0AF',
        categoria: null,
        lugar: typeof lugar === 'string' ? lugar : null,
        hora: horaStr,
      };
    })
    .filter((event: any) => event.start_date && event.title);

  console.log(`Processing ${events.length} valid events`);

  if (events.length === 0) {
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'No se encontraron eventos válidos en el archivo. Verifica que las columnas sean: Fecha, Título, Descripción, Lugar, Hora'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const { error } = await supabaseClient.from('calendar_events').insert(events);
  
  if (error) {
    console.error('Error inserting events:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${events.length} eventos de calendario actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processFinanciero(supabaseClient: any, data: any[]) {
  // Log column names to help debugging
  if (data.length > 0) {
    console.log('Excel columns found:', Object.keys(data[0]));
    console.log('First 3 rows sample:', data.slice(0, 3));
  }

  // Delete existing data
  await supabaseClient.from('social_investment').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Track the current parent category
  let currentParent: string | null = null;

  // Process each row
  const investments = data
    .map((row: any, index: number) => {
      const keys = Object.keys(row);
      const values = Object.values(row);
      
      // First column is the project name
      const projectName = String(values[0] || '').trim();
      
      // Skip empty rows or header rows
      if (!projectName || 
          projectName.toLowerCase() === 'proyecto' || 
          projectName.toLowerCase() === 'project' ||
          projectName.toLowerCase().includes('porcentaje de ejecucion') ||
          projectName === 'TOTAL') {
        return null;
      }
      
      // Determine if this is a parent (all caps with letters, not just numbers)
      const isParent = projectName === projectName.toUpperCase() && 
                      /[A-Z]/.test(projectName) &&
                      projectName.length > 3;
      
      // Update current parent if this is a parent row
      if (isParent) {
        currentParent = projectName;
      }
      
      // Extract numeric values from subsequent columns
      const budget = parseFloat(String(values[1] || 0).replace(/[\$,\s]/g, '')) || 0;
      const executed = parseFloat(String(values[2] || 0).replace(/[\$,\s]/g, '')) || 0;
      const pending = parseFloat(String(values[3] || 0).replace(/[\$,\s]/g, '')) || 0;
      // Read execution percentage from column F (index 4) - Excel stores it as decimal (0.8 = 80%)
      const executionPercentage = Math.round((parseFloat(String(values[4] || 0).replace(/[%\s]/g, '')) || 0) * 100);

      const investment = {
        project_name: projectName,
        category: isParent ? projectName : (currentParent || 'Otros'),
        budget_2025: budget,
        executed: executed,
        pending: pending,
        execution_percentage: executionPercentage,
        is_parent: isParent,
        parent_category: isParent ? null : currentParent,
      };
      
      console.log('Mapped investment:', investment);
      return investment;
    })
    .filter((investment: any) => investment !== null);

  if (investments.length === 0) {
    throw new Error('No se encontraron datos válidos en el archivo Excel. Verifica que las columnas sean correctas.');
  }

  console.log(`Inserting ${investments.length} investment records`);
  const { error: insertError } = await supabaseClient.from('social_investment').insert(investments);
  
  if (insertError) {
    console.error('Insert error:', insertError);
    throw insertError;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${investments.length} registros de inversión social actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}


async function processEducationBeneficiaries(supabaseClient: any, data: any[]) {
  console.log('Processing education beneficiaries...');
  
  // Log column names for debugging
  if (data.length > 0) {
    console.log('Excel columns found:', Object.keys(data[0]));
  }

  // Delete existing data
  await supabaseClient
    .from('education_beneficiaries')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  // Parse numeric values
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Insert new data
  const beneficiaries = data
    .filter((row: any) => {
      // Filter out empty rows
      const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '');
      return hasData;
    })
    .map((row: any) => {
      // Use 'Base' column as the main category (Educación, Formare, etc.)
      // 'Programa' column contains the specific program name for filtering
      const base = row['Base'] || row['base'] || '';
      const programa = row['Programa'] || row['programa'] || '';
      
      return {
        programa: base, // Store Base in programa field (Educación, Formare)
        departamento: row['Departamento'] || row['departamento'] || row['Depto'] || '',
        categoria: programa, // Store Programa in categoria field for filtering
        valor: parseNumeric(row['Valor'] || row['valor'] || 0),
        year: parseInt(row['Año'] || row['año'] || row['Year'] || row['year'] || '2025'),
      };
    })
    .filter((item: any) => 
      item.programa && 
      item.departamento && 
      item.valor > 0 &&
      (item.programa === 'Educación' || item.programa === 'Formare')
    );

  if (beneficiaries.length === 0) {
    throw new Error('No se encontraron datos válidos de beneficiarios. Verifica que las columnas incluyan: Programa, Departamento, Valor, Año.');
  }

  console.log(`Inserting ${beneficiaries.length} beneficiary records`);

  const { error } = await supabaseClient
    .from('education_beneficiaries')
    .insert(beneficiaries);
  
  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${beneficiaries.length} registros de beneficiarios actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processEducationIndicators(supabaseClient: any, data: any[]) {
  console.log('Processing education indicators...');
  
  // Log column names for debugging
  if (data.length > 0) {
    console.log('Excel columns found:', Object.keys(data[0]));
  }

  // Parse numeric values
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // First, map the data to get all indicators
  const indicators = data
    .filter((row: any) => {
      // Filter out empty rows
      const hasData = Object.values(row).some(val => val !== null && val !== undefined && val !== '');
      return hasData;
    })
    .map((row: any) => ({
      seccion: row['sección'] || row['Sección'] || row['seccion'] || row['Seccion'] || 'General',
      indicador: row['indicador'] || row['Indicador'] || '',
      descripcion: row['Descripción'] || row['descripcion'] || row['Descripcion'] || null,
      departamento: row['entidad'] || row['Entidad'] || row['Departamento'] || row['departamento'] || row['Depto'] || null,
      municipio: row['Municipio'] || row['municipio'] || null,
      unidad: row['unidad_medida'] || row['Unidad de medida'] || row['Unidad'] || row['unidad'] || null,
      valor: parseNumeric(row['dato'] || row['Dato'] || row['Valor'] || row['valor'] || 0),
      meta: parseNumeric(row['Meta'] || row['meta'] || 0),
      cumplimiento: parseNumeric(row['Cumplimiento'] || row['cumplimiento'] || row['%'] || 0),
      year: parseInt(row['año'] || row['Año'] || row['Year'] || row['year'] || '2024'),
      categoria: row['categoría'] || row['Categoría'] || row['categoria'] || row['Categoria'] || null,
      categoria_2: row['categoría 2'] || row['Categoría 2'] || row['categoria_2'] || row['Categoria_2'] || null,
      categoria_3: row['categoría 3'] || row['Categoría 3'] || row['categoria_3'] || row['Categoria_3'] || null,
    }))
    .filter((item: any) => item.indicador);

  // Identify unique sections in the uploaded data
  const uniqueSections = [...new Set(indicators.map((item: any) => item.seccion))];
  console.log('Sections to update:', uniqueSections);

  // Delete only data from the sections present in this upload
  for (const section of uniqueSections) {
    console.log(`Deleting existing data for section: ${section}`);
    await supabaseClient
      .from('education_indicators')
      .delete()
      .eq('seccion', section);
  }

  if (indicators.length === 0) {
    throw new Error('No se encontraron datos válidos de indicadores. Verifica que las columnas incluyan: Sección, Indicador, Valor.');
  }

  console.log(`Inserting ${indicators.length} education indicator records in batches...`);

  const batchSize = 1000;

  for (let i = 0; i < indicators.length; i += batchSize) {
    const batch = indicators.slice(i, i + batchSize);
    console.log(`Inserting batch ${i / batchSize + 1} with ${batch.length} records`);

    const { error } = await supabaseClient
      .from('education_indicators')
      .insert(batch);
    
    if (error) {
      console.error('Insert error in batch:', error);
      throw error;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${indicators.length} indicadores educativos actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processEntrepreneurshipIndicators(supabaseClient: any, data: any[]) {
  console.log(`Processing ${data.length} entrepreneurship indicator rows for EAP historical data`);
  
  if (data.length === 0) {
    throw new Error('El archivo Excel está vacío o no tiene datos válidos');
  }

  // Log the structure to understand the format
  console.log('First row keys:', Object.keys(data[0]));
  console.log('First row sample:', JSON.stringify(data[0]).substring(0, 200));
  
  const parseNumeric = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const str = String(value)
      .replace(/[$\s]/g, '')  // Remove dollar signs and spaces
      .replace(/,/g, '')       // Remove commas
      .replace(/%/g, '');      // Remove percentage signs
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Detect year columns - look for columns that are years (2013, 2014, etc.)
  const firstRow: any = data[0];
  const allKeys = Object.keys(firstRow);
  const yearColumns = allKeys.filter(key => /^20\d{2}$/.test(key)).sort();
  
  console.log('Detected year columns:', yearColumns);
  
  if (yearColumns.length === 0) {
    throw new Error('No se encontraron columnas de años (2013, 2014, etc.). Verifica el formato del archivo.');
  }

  // Detect the column that contains the indicator name (label)
  const indicatorColumnName =
    // Prefer explicit label columns that are not year columns
    allKeys.find((key) => {
      if (yearColumns.includes(key)) return false;
      const lower = key.toLowerCase();
      return (
        lower.includes('indicador') ||
        lower.includes('nombre') ||
        key.startsWith('__EMPTY')
      );
    }) ||
    // Fallback: any non-year column
    allKeys.find((key) => !yearColumns.includes(key) && key !== 'Total') ||
    // Absolute fallback: first column
    allKeys[0];
  
  console.log(`Using indicator column: "${indicatorColumnName}"`);

  // Track which indicators we've seen (to handle duplicate rows like "Crecieron a mas de dos digitos")
  const seenIndicators = new Map<string, Set<number>>();

  // Map the data - each row is an indicator, and we want ALL years
  const historicalIndicators: { indicator_name: string; year: number; value: number }[] = [];

  data.forEach((row: any) => {
    const rawName = row[indicatorColumnName];
    let indicatorName = String(rawName ?? '').trim();

    // Skip empty rows, totals, etc.
    if (!indicatorName || indicatorName.toLowerCase().includes('total')) {
      return;
    }

    // Process each year column for this indicator
    yearColumns.forEach((yearCol) => {
      const year = parseInt(yearCol);
      const rawValue = row[yearCol];
      const value = parseNumeric(rawValue);

      // Skip null/undefined values
      if (value === null) return;

      // Check if this is a percentage value (0-1 range or has % in original)
      const isPercentage = typeof rawValue === 'string' && rawValue.includes('%');
      
      // Get unique key for this indicator+year combination
      const uniqueKey = `${indicatorName}-${year}`;
      
      // Track if we've already seen this indicator for this year
      if (!seenIndicators.has(indicatorName)) {
        seenIndicators.set(indicatorName, new Set());
      }
      
      // For duplicate indicator names (like "Crecieron a mas de dos digitos" appearing twice)
      // Skip if we already have this year, unless the new value is a percentage
      if (seenIndicators.get(indicatorName)!.has(year)) {
        // Only replace if this is clearly a percentage and existing wasn't
        if (!isPercentage) return;
      }
      
      seenIndicators.get(indicatorName)!.add(year);

      console.log(`Mapping indicator: "${indicatorName}" for year ${year} = ${value}`);

      historicalIndicators.push({
        indicator_name: indicatorName,
        year,
        value,
      });
    });
  });

  if (historicalIndicators.length === 0) {
    throw new Error(`No se encontraron indicadores válidos en el archivo. Columnas detectadas: ${allKeys.join(', ')}`);
  }

  console.log(`Found ${historicalIndicators.length} historical indicator records across ${yearColumns.length} years`);

  // Delete ALL existing EAP historical data and replace with new data
  const { error: deleteError } = await supabaseClient
    .from('eap_historical_indicators')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('Delete error:', deleteError);
    throw deleteError;
  }

  console.log(`Inserting ${historicalIndicators.length} EAP historical indicator records...`);

  // Insert in batches to avoid potential issues with large datasets
  const BATCH_SIZE = 100;
  for (let i = 0; i < historicalIndicators.length; i += BATCH_SIZE) {
    const batch = historicalIndicators.slice(i, i + BATCH_SIZE);
    const { error } = await supabaseClient
      .from('eap_historical_indicators')
      .insert(batch);
    
    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)`);
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${historicalIndicators.length} indicadores históricos EAP actualizados exitosamente (${yearColumns.join(', ')})`,
      years: yearColumns,
      totalRecords: historicalIndicators.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processAreaIndicators(supabaseClient: any, data: any[], moduleId: string) {
  // Special handling for entrepreneurship module - use dedicated table
  if (moduleId === 'emprendimiento') {
    return await processEntrepreneurshipIndicators(supabaseClient, data);
  }

  // Map module IDs to area names for other modules
  const areaMap: Record<string, string> = {
    'financiero': 'Financiero',
    'educacion': 'Educación',
    'desarrollo_rural': 'Desarrollo rural',
    'especiales': 'Proyectos especiales',
    'contexto': 'Contexto socioeconómico',
  };

  const areaName = areaMap[moduleId];

  // Delete existing data for this area
  await supabaseClient
    .from('strategic_indicators')
    .delete()
    .eq('area', areaName);

  // Insert new data
  const parseNumeric = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const indicators = data.map((row: any) => ({
    indicator_name: row['Indicador'] || row['indicador'],
    area: areaName,
    keyword: row['PALABRA CLAVE'] || row['Keyword'] || row['keyword'] || row['Palabra clave'],
    unit: row['Unidad'] || row['unidad'],
    annual_goal: parseNumeric(
      row['Meta año'] ??
      row['Avance anual 2025'] ??
      row['Meta 2025'] ??
      row['meta_2025'] ??
      0
    ),
    accumulated_value: parseNumeric(
      row['Valor acumulado'] ??
      row['__EMPTY'] ??
      row['Acumulado'] ??
      row['acumulado'] ??
      0
    ),
    accumulated_percentage: parseNumeric(
      row['% acumulado'] ??
      row['% Acumulado'] ??
      row['__EMPTY_1'] ??
      row['porcentaje_acumulado'] ??
      0
    ),
    achievement_2023: parseNumeric(
      row['Logro 2023'] ??
      row['__EMPTY_2'] ??
      row['logro_2023'] ??
      0
    ),
    achievement_2024: parseNumeric(
      row['Logro 2024'] ??
      row['__EMPTY_3'] ??
      row['logro_2024'] ??
      0
    ),
  }));

  const { error } = await supabaseClient.from('strategic_indicators').insert(indicators);
  
  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${indicators.length} indicadores de ${areaName} actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processRuralDevelopment(supabaseClient: any, data: any[]) {
  // Log column names to help debugging
  if (data.length > 0) {
    console.log('Cacao Excel columns found:', Object.keys(data[0]));
  }

  // Delete existing data
  await supabaseClient.from('rural_development_indicators').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const parseNumeric = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Process all cacao data (removed "Monto ejecutado" filter to include Generación R, etc.)
  const indicators = data
    .filter((row: any) => {
      const seccion = row['sección'] || row['Sección'] || row['seccion'] || '';
      const indicador = row['indicador'] || row['Indicador'] || '';
      // Filter out empty rows
      return seccion && indicador;
    })
    .map((row: any) => {
      const seccion = row['sección'] || row['Sección'] || row['seccion'] || '';
      const indicador = row['indicador'] || row['Indicador'] || '';
      const categoria = row['categoría'] || row['Categoría'] || row['categoria'] || 'Total';
      const valor = parseNumeric(row['dato'] || row['Dato'] || row['valor'] || row['Valor']);
      // Handle year that might be formatted as "2,025" 
      const yearRaw = row['año'] || row['Año'] || row['year'] || '2024';
      const year = parseInt(String(yearRaw).replace(/,/g, ''));
      const unidadMedida = row['unidad_medida'] || row['Unidad_medida'] || row['Unidad'] || row['unidad'] || '';

      return {
        seccion: seccion,
        indicador: indicador,
        categoria: categoria,
        valor: valor,
        year: isNaN(year) ? 2024 : year,
        unidad_medida: unidadMedida,
      };
    })
    .filter((item: any) => item.indicador && item.seccion);

  console.log(`Processing ${indicators.length} rural development indicators`);

  if (indicators.length > 0) {
    const { error } = await supabaseClient.from('rural_development_indicators').insert(indicators);
    
    if (error) {
      console.error('Error inserting rural development indicators:', error);
      throw error;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${indicators.length} indicadores de Desarrollo Rural actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processRuralBeneficiaries(supabaseClient: any, data: any[]) {
  // Log column names to help debugging
  if (data.length > 0) {
    console.log('Rural Beneficiaries columns found:', Object.keys(data[0]));
  }

  // Delete existing data
  await supabaseClient.from('rural_beneficiaries').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const parseNumeric = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Process beneficiaries data
  const beneficiaries = data
    .filter((row: any) => {
      const seccion = row['Sección'] || row['sección'] || row['seccion'] || '';
      return seccion; // Filter out empty rows
    })
    .map((row: any) => {
      return {
        base: row['Base'] || row['base'] || '',
        seccion: row['Sección'] || row['sección'] || row['seccion'] || '',
        programa: row['Programa'] || row['programa'] || '',
        departamento: row['Departamento'] || row['departamento'] || '',
        cod_entidad: row['cod_entidad'] || row['Cod_entidad'] || '',
        entidad: row['entidad'] || row['Entidad'] || '',
        categoria: row['Categoría'] || row['categoría'] || row['categoria'] || 'Total Beneficiarios',
        valor: parseNumeric(row['Valor'] || row['valor']),
        year: parseInt(row['Año'] || row['año'] || row['year'] || '2024'),
      };
    })
    .filter((item: any) => item.seccion);

  console.log(`Processing ${beneficiaries.length} rural beneficiaries`);

  if (beneficiaries.length > 0) {
    const { error } = await supabaseClient.from('rural_beneficiaries').insert(beneficiaries);
    
    if (error) {
      console.error('Error inserting rural beneficiaries:', error);
      throw error;
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${beneficiaries.length} beneficiarios de Desarrollo Rural actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processGeorreferenciacion(supabaseClient: any, data: any[]) {
  // Delete existing data
  await supabaseClient.from('map_locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert new data
  const locations = data.map((row: any) => ({
    name: row['Nombre'] || row['nombre'] || row['name'],
    description: row['Descripción'] || row['descripcion'] || row['description'],
    latitude: parseFloat(row['Latitud'] || row['latitud'] || row['latitude'] || 0),
    longitude: parseFloat(row['Longitud'] || row['longitud'] || row['longitude'] || 0),
    category: row['Categoría'] || row['categoria'] || row['category'],
    icon: row['Icono'] || row['icono'] || row['icon'],
  }));

  const { error } = await supabaseClient.from('map_locations').insert(locations);
  
  if (error) throw error;

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${locations.length} ubicaciones actualizadas exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processSpecialProjects(supabaseClient: any, data: any[]) {
  // Log column names to help debugging
  if (data.length > 0) {
    console.log('Special Projects columns found:', Object.keys(data[0]));
  }

  // Delete existing data
  await supabaseClient.from('special_projects_indicators').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const parseNumeric = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const str = String(value)
      .replace(/[%\s]/g, '')
      .replace(/,/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  };

  // Process special projects data
  const indicators = data
    .filter((row: any) => {
      const codIndicador = row['cod_indicador'] || row['Cod_indicador'] || row['cod indicador'] || '';
      const indicador = row['indicador'] || row['Indicador'] || '';
      return codIndicador || indicador;
    })
    .map((row: any) => {
      // Handle year that might be formatted as "2,025" 
      const yearRaw = row['año'] || row['Año'] || row['year'] || '2024';
      const year = parseInt(String(yearRaw).replace(/,/g, ''));

      return {
        base: row['base'] || row['Base'] || 'Proyectos especiales',
        seccion: row['sección'] || row['Sección'] || row['seccion'] || '',
        cod_indicador: row['cod_indicador'] || row['Cod_indicador'] || row['cod indicador'] || '',
        indicador: row['indicador'] || row['Indicador'] || '',
        categoria: row['categoría'] || row['Categoría'] || row['categoria'] || '',
        cod_entidad: row['cod_entidad'] || row['Cod_entidad'] || '',
        entidad: row['entidad'] || row['Entidad'] || '',
        dato: parseNumeric(row['dato'] || row['Dato']),
        year: isNaN(year) ? 2024 : year,
        periodicidad: row['periodicidad'] || row['Periodicidad'] || 'Anual',
        mes_trimestre: row['mes_trimestre'] || row['Mes_trimestre'] || 'Na',
        fuente: row['fuente'] || row['Fuente'] || '',
        unidad_medida: row['unidad_medida'] || row['Unidad_medida'] || row['Unidad'] || '',
      };
    })
    .filter((item: any) => item.cod_indicador || item.indicador);

  console.log(`Processing ${indicators.length} special projects indicators`);

  if (indicators.length > 0) {
    // Insert in batches to avoid exceeding payload limits
    const BATCH_SIZE = 500;
    for (let i = 0; i < indicators.length; i += BATCH_SIZE) {
      const batch = indicators.slice(i, i + BATCH_SIZE);
      const { error } = await supabaseClient.from('special_projects_indicators').insert(batch);
      
      if (error) {
        console.error('Error inserting special projects indicators batch:', error);
        throw error;
      }
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(indicators.length / BATCH_SIZE)}`);
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${indicators.length} indicadores de Proyectos Especiales actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processSocialInvestmentHistorical(supabaseClient: any, jsonData: any[], worksheet: any) {
  // Import XLSX library for raw cell access
  const XLSX = await import('https://esm.sh/xlsx@0.18.5');
  
  console.log('Processing social investment historical...');
  console.log('JSON data length:', jsonData.length);
  
  const records: { year: number; tipo: string; valor: number }[] = [];
  
  const parseValue = (val: any): number => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'number') return val;
    // Remove any formatting (commas, periods as thousands separators, spaces, currency symbols)
    const cleanedVal = String(val).replace(/[$,\s]/g, '').replace(/\.(?=\d{3})/g, '');
    const num = parseFloat(cleanedVal);
    return isNaN(num) ? 0 : num;
  };
  
  // The file structure based on logs:
  // Row 0 (jsonData[0]): Contains years as VALUES in __EMPTY_1, __EMPTY_2, etc. (this is the header row)
  // Row 1 (jsonData[1]): PROPIOS - actual data with __EMPTY = "PROPIOS", __EMPTY_1 = value for 2012, etc.
  // Row 2 (jsonData[2]): TERCEROS
  // Row 3 (jsonData[3]): TOTAL
  
  if (jsonData.length < 3) {
    throw new Error('El archivo debe tener al menos 3 filas (encabezados, PROPIOS, TERCEROS)');
  }
  
  // First row contains the year headers as values
  const headerRow = jsonData[0];
  console.log('Header row:', JSON.stringify(headerRow));
  
  // Build a map of column key -> year
  const columnToYear: Record<string, number> = {};
  for (const [key, value] of Object.entries(headerRow)) {
    // Check if value is a year
    if (typeof value === 'number' && value >= 2000 && value <= 2100) {
      columnToYear[key] = value;
      console.log(`Column ${key} maps to year ${value}`);
    } else if (typeof value === 'string') {
      const yearMatch = value.match(/^(20\d{2})$/);
      if (yearMatch) {
        columnToYear[key] = parseInt(yearMatch[1]);
        console.log(`Column ${key} maps to year ${yearMatch[1]}`);
      }
    }
  }
  
  console.log('Year columns found:', Object.keys(columnToYear).length);
  
  if (Object.keys(columnToYear).length === 0) {
    throw new Error('No se encontraron columnas con años válidos en la primera fila');
  }
  
  // Find PROPIOS and TERCEROS rows
  let propiosRow: any = null;
  let tercerosRow: any = null;
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    // Check first column for label
    const firstColKeys = ['__EMPTY', Object.keys(row)[0]];
    for (const key of firstColKeys) {
      const val = row[key];
      if (val) {
        const valStr = String(val).toUpperCase().trim();
        if (valStr === 'PROPIOS' || valStr.includes('PROPIO')) {
          propiosRow = row;
          console.log('Found PROPIOS row at index', i);
        } else if (valStr === 'TERCEROS' || valStr.includes('TERCERO')) {
          tercerosRow = row;
          console.log('Found TERCEROS row at index', i);
        }
      }
    }
  }
  
  if (!propiosRow || !tercerosRow) {
    // Fallback: use rows 1 and 2 (indices 1 and 2 in jsonData)
    console.log('Using fallback row positions');
    propiosRow = jsonData[1];
    tercerosRow = jsonData[2];
  }
  
  console.log('PROPIOS row:', JSON.stringify(propiosRow));
  console.log('TERCEROS row:', JSON.stringify(tercerosRow));
  
  // Extract values for each year
  for (const [colKey, year] of Object.entries(columnToYear)) {
    const propiosVal = parseValue(propiosRow[colKey]);
    const tercerosVal = parseValue(tercerosRow[colKey]);
    
    console.log(`Year ${year}: Propios=${propiosVal}, Terceros=${tercerosVal}`);
    
    if (propiosVal > 0 || tercerosVal > 0) {
      records.push({ year, tipo: 'Propios', valor: propiosVal });
      records.push({ year, tipo: 'Terceros', valor: tercerosVal });
    }
  }
  
  console.log(`Total records to insert: ${records.length}`);
  
  if (records.length === 0) {
    throw new Error('No se encontraron datos válidos. Asegúrese de que el archivo tenga años en la primera fila y valores en las filas PROPIOS/TERCEROS.');
  }
  
  // Delete existing data
  const { error: deleteError } = await supabaseClient
    .from('social_investment_historical')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (deleteError) {
    console.error('Error deleting existing data:', deleteError);
    throw deleteError;
  }
  
  // Insert new data
  const { error: insertError } = await supabaseClient
    .from('social_investment_historical')
    .insert(records);
  
  if (insertError) {
    console.error('Error inserting social investment historical:', insertError);
    throw insertError;
  }
  
  const years = [...new Set(records.map(r => r.year))].sort((a, b) => a - b);
  const yearsRange = `${years[0]}-${years[years.length - 1]}`;
  
  return new Response(
    JSON.stringify({ 
      success: true,
      message: `${years.length} años (${yearsRange}) de inversión social histórica actualizados exitosamente`
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
