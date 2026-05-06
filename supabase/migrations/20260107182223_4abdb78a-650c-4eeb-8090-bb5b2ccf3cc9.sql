-- Create table for monthly financial execution tracking
CREATE TABLE public.financial_execution_monthly (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  month_name TEXT NOT NULL,
  reference_date DATE NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL,
  saldo_inicial NUMERIC NOT NULL DEFAULT 0,
  executed NUMERIC NOT NULL DEFAULT 0,
  pending NUMERIC NOT NULL DEFAULT 0,
  execution_percentage NUMERIC NOT NULL DEFAULT 0,
  is_parent BOOLEAN NOT NULL DEFAULT false,
  parent_category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(year, month, project_name, category)
);

-- Enable Row Level Security
ALTER TABLE public.financial_execution_monthly ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to financial execution monthly"
ON public.financial_execution_monthly
FOR SELECT
USING (true);

-- Create policies for admin management
CREATE POLICY "Admins can insert financial execution monthly"
ON public.financial_execution_monthly
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update financial execution monthly"
ON public.financial_execution_monthly
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete financial execution monthly"
ON public.financial_execution_monthly
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_execution_monthly_updated_at
BEFORE UPDATE ON public.financial_execution_monthly
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying by year and month
CREATE INDEX idx_financial_execution_monthly_year_month ON public.financial_execution_monthly(year, month);
CREATE INDEX idx_financial_execution_monthly_category ON public.financial_execution_monthly(category);