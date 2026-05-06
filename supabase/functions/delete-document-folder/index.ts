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

    // Get category ID from request
    const { categoryId } = await req.json();

    if (!categoryId) {
      throw new Error('Missing categoryId');
    }

    console.log(`Deleting document folder with category ID: ${categoryId}`);

    // Get all documents in this category
    const { data: documents, error: docsError } = await supabaseClient
      .from('documents')
      .select('file_path')
      .eq('category_id', categoryId);

    if (docsError) {
      throw new Error(`Failed to fetch documents: ${docsError.message}`);
    }

    // Delete files from storage
    if (documents && documents.length > 0) {
      const filePaths = documents.map((doc: any) => doc.file_path);
      const { error: storageError } = await supabaseClient.storage
        .from('documents')
        .remove(filePaths);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
      }

      console.log(`Deleted ${filePaths.length} files from storage`);
    }

    // Delete document records
    const { error: deleteDocsError } = await supabaseClient
      .from('documents')
      .delete()
      .eq('category_id', categoryId);

    if (deleteDocsError) {
      throw new Error(`Failed to delete documents: ${deleteDocsError.message}`);
    }

    // Delete category
    const { error: deleteCategoryError } = await supabaseClient
      .from('document_categories')
      .delete()
      .eq('id', categoryId);

    if (deleteCategoryError) {
      throw new Error(`Failed to delete category: ${deleteCategoryError.message}`);
    }

    console.log(`Successfully deleted category and ${documents?.length || 0} documents`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Carpeta eliminada exitosamente',
        deletedDocuments: documents?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error deleting folder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
