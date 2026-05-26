-- ─── CATEGORIES ─────────────────────────────────────────────────────────────
INSERT INTO categories (id, name, icon, color, description) VALUES
  ('plumbing',    'Plomería',      '🔧', '#3B82F6', 'Reparación de tuberías, fugas y sanitarios'),
  ('electrical',  'Electricidad',  '⚡', '#F59E0B', 'Instalaciones y reparaciones eléctricas'),
  ('cleaning',    'Limpieza',      '🧹', '#10B981', 'Limpieza del hogar y oficinas'),
  ('tutoring',    'Tutoría',       '📚', '#8B5CF6', 'Clases particulares y apoyo académico'),
  ('design',      'Diseño',        '🎨', '#EC4899', 'Diseño gráfico, web y UX'),
  ('tech',        'Técnico',       '💻', '#6366F1', 'Soporte técnico y reparación de equipos'),
  ('carpentry',   'Carpintería',   '🪚', '#92400E', 'Muebles, puertas y reparaciones de madera'),
  ('painting',    'Pintura',       '🖌️', '#EF4444', 'Pintura interior y exterior'),
  ('gardening',   'Jardinería',    '🌿', '#059669', 'Mantenimiento y diseño de jardines'),
  ('moving',      'Mudanza',       '📦', '#64748B', 'Transporte y traslado de muebles y objetos')
ON CONFLICT (id) DO NOTHING;

-- ─── DEMO USERS (passwords must be set via Supabase Auth dashboard or magic link) ──
-- NOTE: In production, users are created via Supabase Auth.
-- These INSERTs assume auth.users records already exist with these UUIDs.
-- Run this after creating auth users manually or via the dashboard.

-- Demo user accounts (insert into public.users directly for seed purposes)
-- UUIDs below are placeholder — replace with real auth UUIDs after creating auth users
INSERT INTO users (id, name, email, role, avatar_url, latitude, longitude) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Ana García',      'ana@demo.lokro.app',     'USER',     NULL, 40.4168,  -3.7038),
  ('00000000-0000-0000-0000-000000000002', 'Carlos Martínez', 'carlos@demo.lokro.app',  'USER',     NULL, 40.4190,  -3.6980),
  ('00000000-0000-0000-0000-000000000003', 'María López',     'maria@demo.lokro.app',   'USER',     NULL, 40.4150,  -3.7100),
  ('00000000-0000-0000-0000-000000000004', 'Pedro Sánchez',   'pedro@demo.lokro.app',   'PROVIDER', NULL, 40.4200,  -3.7050),
  ('00000000-0000-0000-0000-000000000005', 'Laura Fernández', 'laura@demo.lokro.app',   'PROVIDER', NULL, 40.4130,  -3.6950),
  ('00000000-0000-0000-0000-000000000006', 'Javier Ruiz',     'javier@demo.lokro.app',  'PROVIDER', NULL, 40.4220,  -3.7020),
  ('00000000-0000-0000-0000-000000000007', 'Elena Torres',    'elena@demo.lokro.app',   'PROVIDER', NULL, 40.4170,  -3.7080),
  ('00000000-0000-0000-0000-000000000008', 'Miguel Díaz',     'miguel@demo.lokro.app',  'PROVIDER', NULL, 40.4100,  -3.7010),
  ('00000000-0000-0000-0000-000000000009', 'Sofía Moreno',    'sofia@demo.lokro.app',   'PROVIDER', NULL, 40.4250,  -3.7000),
  ('00000000-0000-0000-0000-000000000010', 'Admin Lokro',     'admin@demo.lokro.app',   'ADMIN',    NULL, 40.4168,  -3.7038)
ON CONFLICT (id) DO NOTHING;

-- ─── PROVIDER PROFILES ───────────────────────────────────────────────────────
INSERT INTO provider_profiles (id, user_id, bio, hourly_rate, available, average_rating, total_reviews) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Fontanero certificado con 10 años de experiencia. Especializado en instalaciones y emergencias 24/7.', 4500, TRUE, 4.8, 42),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Electricista industrial y doméstica. Trabajos con garantía y materiales de primera calidad.', 5000, TRUE, 4.6, 31),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', 'Servicio de limpieza profesional para hogares y oficinas. Equipo propio, productos ecológicos.', 2500, FALSE, 4.9, 87),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'Diseñadora gráfica y UX/UI. Portfolio disponible. Proyectos desde branding hasta apps.', 7000, TRUE, 5.0, 18),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'Técnico en informática. Reparación de PC, Mac, smartphones. Servicio a domicilio.', 3500, TRUE, 4.5, 55),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', 'Tutora de matemáticas, física y química. Bachillerato y universidad. Resultados garantizados.', 3000, TRUE, 4.7, 29)
ON CONFLICT (id) DO NOTHING;

-- ─── PROVIDER SPECIALTIES ────────────────────────────────────────────────────
INSERT INTO provider_specialties (provider_id, category_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'plumbing'),
  ('10000000-0000-0000-0000-000000000002', 'electrical'),
  ('10000000-0000-0000-0000-000000000003', 'cleaning'),
  ('10000000-0000-0000-0000-000000000004', 'design'),
  ('10000000-0000-0000-0000-000000000005', 'tech'),
  ('10000000-0000-0000-0000-000000000006', 'tutoring')
ON CONFLICT (provider_id, category_id) DO NOTHING;

-- ─── PROVIDER LOCATIONS ──────────────────────────────────────────────────────
INSERT INTO provider_locations (provider_id, latitude, longitude) VALUES
  ('10000000-0000-0000-0000-000000000001', 40.4200, -3.7050),
  ('10000000-0000-0000-0000-000000000002', 40.4130, -3.6950),
  ('10000000-0000-0000-0000-000000000003', 40.4220, -3.7020),
  ('10000000-0000-0000-0000-000000000004', 40.4170, -3.7080),
  ('10000000-0000-0000-0000-000000000005', 40.4100, -3.7010),
  ('10000000-0000-0000-0000-000000000006', 40.4250, -3.7000)
ON CONFLICT (provider_id) DO NOTHING;

-- ─── SERVICE REQUESTS ────────────────────────────────────────────────────────
INSERT INTO service_requests (id, user_id, provider_id, category_id, description, address, latitude, longitude, requested_date, status, estimated_price, final_price) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'plumbing',   'Fuga de agua bajo el fregadero de la cocina, urgente.', 'Calle Gran Vía 45, Madrid', 40.4200, -3.7050, NOW() - INTERVAL '2 days', 'COMPLETED', 4500, 4500),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'electrical', 'Instalación de enchufes en habitación nueva. Necesito 4 puntos de luz.', 'Avenida Castellana 120, Madrid', 40.4190, -3.6980, NOW() - INTERVAL '5 days', 'COMPLETED', 8000, 7500),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'cleaning',   'Limpieza general del piso de 80m2 antes de entrar a vivir.', 'Calle Alcalá 200, Madrid', 40.4150, -3.7100, NOW() + INTERVAL '1 day', 'ACCEPTED', 12000, NULL),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'design',     'Diseño de logo y manual de marca para mi empresa de consultoría.', 'Online', 40.4168, -3.7038, NOW() + INTERVAL '3 days', 'PENDING', 25000, NULL),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 'tech',       'Mi portátil no enciende, necesita revisión. Marca Dell XPS 15.', 'Calle Serrano 55, Madrid', 40.4220, -3.7020, NOW(), 'IN_PROGRESS', 6000, NULL),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000006', 'tutoring',   'Clases de matemáticas para selectividad. 2 sesiones por semana.', 'Calle Fuencarral 30, Madrid', 40.4170, -3.7080, NOW() - INTERVAL '7 days', 'COMPLETED', 9000, 9000),
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'plumbing',   'Cambio de grifo en el baño principal. Tengo el grifo nuevo.', 'Calle Gran Vía 45, Madrid', 40.4200, -3.7050, NOW() + INTERVAL '2 days', 'PENDING', 3000, NULL),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'cleaning',   'Limpieza mensual de oficina 120m2.', 'Paseo Recoletos 12, Madrid', 40.4210, -3.7000, NOW() - INTERVAL '10 days', 'COMPLETED', 18000, 18000),
  ('20000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'electrical', 'Revisión del cuadro eléctrico, saltan los plomos frecuentemente.', 'Calle Toledo 88, Madrid', 40.4130, -3.7100, NOW() - INTERVAL '1 day', 'ACCEPTED', 5500, NULL),
  ('20000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'tutoring',   'Preparación examen química. Una sesión intensiva de 3 horas.', 'Online', 40.4168, -3.7038, NOW() + INTERVAL '4 days', 'PENDING', 9000, NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
INSERT INTO messages (request_id, sender_id, content, read) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Hola Pedro, ¿puedes venir hoy por la tarde?', TRUE),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Claro, puedo estar a las 17h. ¿Te va bien?', TRUE),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Perfecto, te espero.', TRUE),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Buenos días Laura, necesito 4 puntos de luz en una habitación.', TRUE),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Sin problema, ¿tienes preferencia de posición para los enchufes?', TRUE),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Hola, el piso tiene parquet. ¿Usáis productos específicos?', FALSE),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'El portátil da un pitido cuando intento encenderlo.', TRUE),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', 'Ese pitido indica problema de RAM. Lo reviso hoy mismo.', FALSE)
ON CONFLICT DO NOTHING;

-- ─── REVIEWS ────────────────────────────────────────────────────────────────
INSERT INTO reviews (request_id, author_id, target_id, rating, comment, type) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 5, 'Pedro llegó puntual y resolvió la fuga en menos de una hora. 100% recomendado.', 'TO_PROVIDER'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 5, 'Ana fue muy amable y el pago fue inmediato. Excelente cliente.', 'TO_USER'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 4, 'Buen trabajo, tardó un poco más de lo esperado pero el resultado fue perfecto.', 'TO_PROVIDER'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 5, 'Carlos estuvo muy claro con lo que necesitaba. Trabajo sencillo y bien pagado.', 'TO_USER'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000009', 5, 'Sofía es increíble. Mi hija aprobó selectividad con matrícula. ¡Gracias!', 'TO_PROVIDER'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 4, 'Estudiante muy trabajadora y motivada. Fue un placer enseñarle.', 'TO_USER'),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 5, 'Servicio de limpieza impecable. Nuestra oficina quedó como nueva.', 'TO_PROVIDER'),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 5, 'Carlos siempre puntual y las instalaciones están perfectas. Cliente fijo.', 'TO_USER')
ON CONFLICT (request_id, author_id, type) DO NOTHING;

-- ─── PAYMENTS ────────────────────────────────────────────────────────────────
INSERT INTO payments (request_id, amount, platform_fee, provider_amount, status) VALUES
  ('20000000-0000-0000-0000-000000000001', 4500,  450,  4050, 'PAID'),
  ('20000000-0000-0000-0000-000000000002', 7500,  750,  6750, 'PAID'),
  ('20000000-0000-0000-0000-000000000006', 9000,  900,  8100, 'PAID'),
  ('20000000-0000-0000-0000-000000000008', 18000, 1800, 16200, 'PAID')
ON CONFLICT (request_id) DO NOTHING;

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, type, title, message, read) VALUES
  ('00000000-0000-0000-0000-000000000001', 'REQUEST_ACCEPTED', 'Solicitud aceptada', 'Pedro Sánchez ha aceptado tu solicitud de plomería.', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'SERVICE_COMPLETED', 'Servicio completado', 'Tu servicio de plomería ha sido marcado como completado.', TRUE),
  ('00000000-0000-0000-0000-000000000001', 'NEW_REVIEW', 'Nueva reseña', 'Pedro Sánchez te ha dejado una reseña de 5 estrellas.', FALSE),
  ('00000000-0000-0000-0000-000000000002', 'REQUEST_ACCEPTED', 'Solicitud aceptada', 'Laura Fernández ha aceptado tu solicitud de electricidad.', TRUE),
  ('00000000-0000-0000-0000-000000000004', 'NEW_REQUEST', 'Nueva solicitud', 'Ana García te ha enviado una solicitud de plomería.', TRUE),
  ('00000000-0000-0000-0000-000000000004', 'PAYMENT_RECEIVED', 'Pago recibido', 'Has recibido €45.00 por tu servicio de plomería.', FALSE),
  ('00000000-0000-0000-0000-000000000005', 'NEW_REQUEST', 'Nueva solicitud', 'Carlos Martínez te ha enviado una solicitud de electricidad.', TRUE),
  ('00000000-0000-0000-0000-000000000003', 'REQUEST_ACCEPTED', 'Solicitud aceptada', 'Javier Ruiz ha aceptado tu solicitud de limpieza.', FALSE),
  ('00000000-0000-0000-0000-000000000006', 'NEW_REQUEST', 'Nueva solicitud', 'María López te ha enviado una solicitud de limpieza.', TRUE),
  ('00000000-0000-0000-0000-000000000009', 'NEW_REVIEW', 'Nueva reseña', 'María López te ha dejado una reseña de 5 estrellas.', FALSE)
ON CONFLICT DO NOTHING;
