-- Create table for entrepreneurship historical indicators
CREATE TABLE IF NOT EXISTS public.entrepreneurship_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(indicator_name, year)
);

-- Enable Row Level Security
ALTER TABLE public.entrepreneurship_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to entrepreneurship indicators" 
ON public.entrepreneurship_indicators 
FOR SELECT 
USING (true);

-- Create policies for admin operations
CREATE POLICY "Admins can insert entrepreneurship indicators" 
ON public.entrepreneurship_indicators 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update entrepreneurship indicators" 
ON public.entrepreneurship_indicators 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete entrepreneurship indicators" 
ON public.entrepreneurship_indicators 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_entrepreneurship_indicators_updated_at
BEFORE UPDATE ON public.entrepreneurship_indicators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();