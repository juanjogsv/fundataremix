-- Create unified participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base TEXT NOT NULL, -- 'Educación', 'Desarrollo Rural', 'Formare', 'Proyectos Especiales'
  seccion TEXT NOT NULL, -- Subsection within base
  programa TEXT NOT NULL, -- Program name
  departamento TEXT NOT NULL, -- Department/Region
  categoria TEXT DEFAULT 'Total Participantes',
  valor NUMERIC DEFAULT 0, -- Number of participants
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to participants" 
ON public.participants 
FOR SELECT 
USING (true);

-- Admin policies
CREATE POLICY "Admins can insert participants" 
ON public.participants 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update participants" 
ON public.participants 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete participants" 
ON public.participants 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_participants_year ON public.participants(year);
CREATE INDEX idx_participants_base ON public.participants(base);
CREATE INDEX idx_participants_seccion ON public.participants(seccion);
CREATE INDEX idx_participants_departamento ON public.participants(departamento);

-- Create trigger for updating timestamps
CREATE TRIGGER update_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();