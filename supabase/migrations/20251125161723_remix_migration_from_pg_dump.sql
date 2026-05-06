CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: indicator_area; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.indicator_area AS ENUM (
    'Educación',
    'Emprendimiento',
    'Desarrollo rural',
    'Proyectos especiales',
    'Estrategia',
    'Comunicaciones',
    'Financiero',
    'Contexto socioeconómico'
);


--
-- Name: indicator_unit; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.indicator_unit AS ENUM (
    'Porcentaje',
    'Unidades',
    'Pesos'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    color text DEFAULT '#3b82f6'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    file_path text NOT NULL,
    file_type text,
    file_size bigint,
    category_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: map_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    latitude numeric NOT NULL,
    longitude numeric NOT NULL,
    category text,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: strategic_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.strategic_indicators (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    indicator_name text NOT NULL,
    area public.indicator_area NOT NULL,
    keyword text,
    unit public.indicator_unit NOT NULL,
    annual_goal numeric,
    accumulated_value numeric,
    accumulated_percentage numeric,
    achievement_2023 numeric,
    achievement_2024 numeric,
    achievement_2025 numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: document_categories document_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: map_locations map_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_locations
    ADD CONSTRAINT map_locations_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: strategic_indicators strategic_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.strategic_indicators
    ADD CONSTRAINT strategic_indicators_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: calendar_events update_calendar_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: strategic_indicators update_strategic_indicators_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_strategic_indicators_updated_at BEFORE UPDATE ON public.strategic_indicators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: document_categories document_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.document_categories(id) ON DELETE CASCADE;


--
-- Name: documents documents_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.document_categories(id) ON DELETE SET NULL;


--
-- Name: calendar_events Admins can delete calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete calendar events" ON public.calendar_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: document_categories Admins can delete document categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete document categories" ON public.document_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can delete documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: map_locations Admins can delete map locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete map locations" ON public.map_locations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: strategic_indicators Admins can delete strategic indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete strategic indicators" ON public.strategic_indicators FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: calendar_events Admins can insert calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert calendar events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: document_categories Admins can insert document categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert document categories" ON public.document_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can insert documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: map_locations Admins can insert map locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert map locations" ON public.map_locations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: strategic_indicators Admins can insert strategic indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert strategic indicators" ON public.strategic_indicators FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: calendar_events Admins can update calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update calendar events" ON public.calendar_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: document_categories Admins can update document categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update document categories" ON public.document_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can update documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update documents" ON public.documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: map_locations Admins can update map locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update map locations" ON public.map_locations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: strategic_indicators Admins can update strategic indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update strategic indicators" ON public.strategic_indicators FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: calendar_events Allow public read access to calendar; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to calendar" ON public.calendar_events FOR SELECT USING (true);


--
-- Name: document_categories Allow public read access to document categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to document categories" ON public.document_categories FOR SELECT USING (true);


--
-- Name: documents Allow public read access to documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to documents" ON public.documents FOR SELECT USING (true);


--
-- Name: strategic_indicators Allow public read access to indicators; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to indicators" ON public.strategic_indicators FOR SELECT USING (true);


--
-- Name: map_locations Allow public read access to map locations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to map locations" ON public.map_locations FOR SELECT USING (true);


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: calendar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: document_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: map_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: strategic_indicators; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.strategic_indicators ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


