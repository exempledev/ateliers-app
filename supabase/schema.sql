-- Types
CREATE TYPE user_role AS ENUM ('admin', 'animateur', 'participant');
CREATE TYPE atelier_theme AS ENUM ('travail', 'detente');
CREATE TYPE reservation_status AS ENUM ('confirmed', 'cancelled', 'waitlist');

-- Table users (liée à auth.users de Supabase)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'participant',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table ateliers
CREATE TABLE public.ateliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  animateur_id UUID NOT NULL REFERENCES public.users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_participants INT NOT NULL DEFAULT 20,
  theme atelier_theme NOT NULL,
  location TEXT,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table reservations
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  atelier_id UUID NOT NULL REFERENCES public.ateliers(id) ON DELETE CASCADE,
  status reservation_status NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, atelier_id)
);

-- Table email_logs
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_by UUID NOT NULL REFERENCES public.users(id),
  atelier_id UUID REFERENCES public.ateliers(id),
  subject TEXT NOT NULL,
  recipients_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vue: places restantes par atelier
CREATE OR REPLACE VIEW public.ateliers_with_spots AS
SELECT
  a.*,
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_taken,
  a.max_participants - COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS spots_remaining
FROM public.ateliers a
LEFT JOIN public.reservations r ON r.atelier_id = a.id
GROUP BY a.id;

-- Trigger: créer un profil user à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'participant')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ateliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Policies users
CREATE POLICY "Users can read all profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can manage all users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies ateliers
CREATE POLICY "Anyone can read ateliers" ON public.ateliers FOR SELECT USING (true);
CREATE POLICY "Animateurs can manage own ateliers" ON public.ateliers FOR ALL USING (
  animateur_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies reservations
CREATE POLICY "Users can read own reservations" ON public.reservations FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'animateur'))
);
CREATE POLICY "Users can manage own reservations" ON public.reservations FOR ALL USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Policies email_logs
CREATE POLICY "Animateurs and admin can read logs" ON public.email_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'animateur'))
);
CREATE POLICY "Animateurs and admin can insert logs" ON public.email_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'animateur'))
);
