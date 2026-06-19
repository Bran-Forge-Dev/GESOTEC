-- Eliminar tabla si existe para asegurar estructura correcta
DROP TABLE IF EXISTS base_conocimiento CASCADE;

-- Crear tabla para la Base de Conocimiento
CREATE TABLE base_conocimiento (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    icono VARCHAR(50) NOT NULL,
    palabras_clave TEXT[] NOT NULL,
    solucion TEXT NOT NULL,
    creado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por palabras clave
CREATE INDEX idx_base_conocimiento_palabras_clave ON base_conocimiento USING GIN(palabras_clave);

-- Crear índice para búsquedas por categoría
CREATE INDEX idx_base_conocimiento_categoria ON base_conocimiento(categoria);

-- Crear índice para búsquedas por título
CREATE INDEX idx_base_conocimiento_titulo ON base_conocimiento(titulo);

-- Insertar problemas frecuentes iniciales
INSERT INTO base_conocimiento (titulo, descripcion, categoria, icono, palabras_clave, solucion, creado_por) VALUES
    ('No puedo conectarme al WiFi', 'Problemas de conexión a la red inalámbrica de la empresa', 'Red', '📶', ARRAY['wifi', 'red', 'internet', 'conexión', 'inalámbrica'], '1. Reinicia tu dispositivo\n2. Verifica que el WiFi esté activado\n3. Intenta olvidar la red y volver a conectarte\n4. Si persiste, contacta al departamento de TI', NULL),
    ('Impresora no responde', 'La impresora no imprime o no se detecta', 'Hardware', '🖨️', ARRAY['impresora', 'print', 'imprimir', 'papel', 'tinta'], '1. Verifica que la impresora esté encendida\n2. Revisa el nivel de papel y tinta\n3. Verifica que esté conectada al puerto USB o red\n4. Reinicia la impresora y tu computadora', NULL),
    ('Olvidé mi contraseña', 'No puedo acceder a mi cuenta por contraseña olvidada', 'Seguridad', '🔐', ARRAY['contraseña', 'password', 'acceso', 'login', 'sesión'], '1. Haz clic en ''¿Olvidaste tu contraseña?'' en la pantalla de login\n2. Ingresa tu correo electrónico\n3. Sigue las instrucciones del correo de recuperación\n4. Si no recibes el correo, contacta al soporte', NULL),
    ('Computadora lenta', 'El sistema funciona lentamente o se congela', 'Hardware', '💻', ARRAY['lento', 'lentitud', 'congelado', 'freeze', 'rendimiento'], '1. Cierra programas innecesarios\n2. Reinicia tu computadora\n3. Verifica el espacio en disco\n4. Ejecuta un análisis de antivirus\n5. Si el problema persiste, solicita mantenimiento', NULL),
    ('No puedo abrir un archivo', 'El archivo no se abre o muestra error', 'Software', '📄', ARRAY['archivo', 'documento', 'abrir', 'error', 'corrupto'], '1. Verifica que tengas el programa necesario para abrir el archivo\n2. Intenta abrir el archivo en otra aplicación\n3. Verifica que el archivo no esté corrupto\n4. Si es un archivo compartido, solicita que lo reenvíen', NULL),
    ('Correo electrónico no llega', 'No recibo o no puedo enviar correos', 'Software', '📧', ARRAY['correo', 'email', 'mail', 'enviar', 'recibir'], '1. Verifica tu conexión a internet\n2. Revisa la carpeta de spam\n3. Verifica que la dirección del destinatario sea correcta\n4. Limpia la caché del navegador de correo\n5. Contacta al administrador si el problema persiste', NULL),
    ('Pantalla azul de muerte', 'La computadora muestra pantalla azul y se reinicia', 'Hardware', '🔵', ARRAY['pantalla azul', 'blue screen', 'bsod', 'crash', 'reinicia'], '1. Reinicia la computadora\n2. Anota el código de error que aparece\n3. Desconecta dispositivos externos\n4. Si el problema persiste, crea un ticket de soporte técnico', NULL),
    ('VPN no conecta', 'No puedo conectarme a la VPN de la empresa', 'Red', '🔒', ARRAY['vpn', 'red privada', 'remoto', 'trabajo desde casa'], '1. Verifica tu conexión a internet\n2. Reinicia el cliente VPN\n3. Verifica tus credenciales de VPN\n4. Desactiva temporalmente el firewall\n5. Contacta al departamento de TI si el problema persiste', NULL),
    ('Mouse o teclado no funciona', 'El mouse o teclado no responde', 'Hardware', '⌨️', ARRAY['mouse', 'teclado', 'ratón', 'periférico', 'input'], '1. Verifica que estén conectados correctamente\n2. Si son inalámbricos, cambia las baterías\n3. Prueba en otro puerto USB\n4. Reinicia la computadora\n5. Si el problema persiste, solicita un reemplazo', NULL),
    ('No puedo acceder a un sistema', 'Error al intentar ingresar a un sistema específico', 'Software', '🚫', ARRAY['sistema', 'acceso', 'denegado', 'error', 'permisos'], '1. Verifica que tus credenciales sean correctas\n2. Limpia la caché del navegador\n3. Intenta en otro navegador\n4. Verifica que tengas los permisos necesarios\n5. Contacta al administrador del sistema', NULL);
