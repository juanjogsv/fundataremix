-- Create table for operating expenses (Funcionamiento)
CREATE TABLE public.operating_expenses_monthly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  month_name TEXT NOT NULL,
  reference_date DATE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  item_name TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  executed NUMERIC NOT NULL DEFAULT 0,
  execution_percentage NUMERIC NOT NULL DEFAULT 0,
  difference NUMERIC NOT NULL DEFAULT 0,
  is_parent BOOLEAN NOT NULL DEFAULT false,
  parent_category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operating_expenses_monthly ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to operating expenses" 
ON public.operating_expenses_monthly 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert operating expenses" 
ON public.operating_expenses_monthly 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update operating expenses" 
ON public.operating_expenses_monthly 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete operating expenses" 
ON public.operating_expenses_monthly 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_operating_expenses_updated_at
BEFORE UPDATE ON public.operating_expenses_monthly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();