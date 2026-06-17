-- SECCIONES (menu categories)
CREATE TABLE secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  nombre_es TEXT NOT NULL,
  nombre_en TEXT NOT NULL,
  padre_slug TEXT REFERENCES secciones(slug),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- PLATOS (menu items)
CREATE TABLE platos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seccion_slug TEXT NOT NULL REFERENCES secciones(slug),
  nombre_es TEXT NOT NULL,
  nombre_en TEXT NOT NULL,
  descripcion_es TEXT,
  descripcion_en TEXT,
  precio NUMERIC(8,2) NOT NULL,
  foto_url TEXT,
  alergenos TEXT[] DEFAULT '{}',
  es_vegano BOOLEAN NOT NULL DEFAULT false,
  sin_gluten BOOLEAN NOT NULL DEFAULT false,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RESERVAS
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  personas INTEGER NOT NULL,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmada','cancelada')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- GALERIA
CREATE TABLE galeria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  foto_url TEXT NOT NULL,
  alt_es TEXT,
  alt_en TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- INFO_RESTAURANTE (single row)
CREATE TABLE info_restaurante (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nombre TEXT NOT NULL DEFAULT 'Restaurante Casa Goyo',
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  horario_es TEXT,
  horario_en TEXT,
  descripcion_es TEXT,
  descripcion_en TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default info row
INSERT INTO info_restaurante (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Insert menu sections
INSERT INTO secciones (slug, nombre_es, nombre_en, orden) VALUES
  ('primeros', 'Primeros Platos', 'First Courses', 1),
  ('segundos', 'Segundos Platos', 'Main Courses', 2),
  ('postres', 'Postres', 'Desserts', 3),
  ('temporada', 'De Temporada', 'Seasonal', 4),
  ('encargo', 'De Encargo', 'Made to Order', 5),
  ('dulces', 'Dulces Caseros', 'Homemade Sweets', 6),
  ('bebidas', 'Bebidas y Vinos', 'Drinks & Wines', 7),
  ('bar', 'Bar', 'Bar', 8);

INSERT INTO secciones (slug, nombre_es, nombre_en, padre_slug, orden) VALUES
  ('carnes', 'Carnes', 'Meat', 'segundos', 1),
  ('pescados', 'Pescados', 'Fish', 'segundos', 2),
  ('vinos-casa', 'Vinos de la Casa', 'House Wines', 'bebidas', 1),
  ('vinos-blancos', 'Blancos y Rosados', 'Whites & Rosés', 'bebidas', 2),
  ('vinos-tintos', 'Vinos Tintos', 'Red Wines', 'bebidas', 3),
  ('rioja', 'Rioja', 'Rioja', 'vinos-tintos', 1),
  ('ribera', 'Ribera del Duero', 'Ribera del Duero', 'vinos-tintos', 2),
  ('espumosos', 'Vinos Espumosos', 'Sparkling Wines', 'bebidas', 4);

-- RLS Policies
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE platos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_restaurante ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Public read secciones" ON secciones FOR SELECT USING (activo = true);
CREATE POLICY "Public read platos" ON platos FOR SELECT USING (activo = true);
CREATE POLICY "Public read galeria" ON galeria FOR SELECT USING (activo = true);
CREATE POLICY "Public read info" ON info_restaurante FOR SELECT USING (true);
CREATE POLICY "Public insert reservas" ON reservas FOR INSERT WITH CHECK (true);

-- Authenticated users (admin) have full access
CREATE POLICY "Admin all secciones" ON secciones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all platos" ON platos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all reservas" ON reservas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all galeria" ON galeria FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all info" ON info_restaurante FOR ALL USING (auth.role() = 'authenticated');
