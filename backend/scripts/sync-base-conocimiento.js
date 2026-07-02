/**
 * Script para sincronizar la base de conocimiento de Supabase a JSON con embeddings
 * 
 * Este script:
 * 1. Exporta los datos de la tabla base_conocimiento de Supabase
 * 2. Genera embeddings para cada entrada usando Cohere AI API
 * 3. Guarda el resultado en data/base-conocimiento-mejorada.json
 * 
 * Uso: node scripts/sync-base-conocimiento.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de Cohere AI
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Categorías predefinidas
const CATEGORIAS = {
  'Red': ['wifi', 'conexion', 'internet', 'red', 'vpn', 'dns', 'bluetooth', 'cable'],
  'Acceso': ['contraseña', 'login', 'sesion', 'autenticacion', 'bloqueo', 'permisos'],
  'Software': ['aplicacion', 'programa', 'software', 'windows', 'actualizacion', 'driver'],
  'Hardware': ['monitor', 'impresora', 'usb', 'audio', 'microfono', 'webcam', 'bateria'],
  'Email': ['outlook', 'correo', 'email', 'buzon', 'mensaje'],
  'Impresión': ['impresora', 'imprimir', 'papel', 'tinta'],
  'Periféricos': ['mouse', 'teclado', 'auriculares', 'parlantes']
};

// Iconos por categoría
const ICONOS = {
  'Red': '📶',
  'Acceso': '🔐',
  'Software': '💻',
  'Hardware': '🔧',
  'Email': '📧',
  'Impresión': '🖨️',
  'Periféricos': '🖱️'
};

// Determinar categoría basada en palabras clave
function determinarCategoria(titulo, descripcion) {
  const texto = (titulo + ' ' + descripcion).toLowerCase();
  
  for (const [categoria, palabras] of Object.entries(CATEGORIAS)) {
    for (const palabra of palabras) {
      if (texto.includes(palabra)) {
        return categoria;
      }
    }
  }
  
  return 'Software'; // Categoría por defecto
}

// Generar embedding usando Cohere AI
async function generarEmbedding(texto) {
  try {
    const response = await cohere.embed({
      texts: [texto],
      model: 'embed-english-v3.0',
      inputType: 'search_document'
    });
    return response.embeddings[0];
  } catch (error) {
    console.error('Error al generar embedding:', error.message);
    return null;
  }
}

// Función principal
async function sincronizarBaseConocimiento() {
  console.log('🚀 Iniciando sincronización de base de conocimiento...');
  
  try {
    // 1. Obtener datos de Supabase
    console.log('📥 Obteniendo datos de Supabase...');
    const { data: problemas, error } = await supabase
      .from('base_conocimiento')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      throw new Error(`Error al obtener datos de Supabase: ${error.message}`);
    }
    
    console.log(`✅ Se obtuvieron ${problemas.length} registros de Supabase`);
    
    // 2. Procesar cada entrada y generar embeddings
    console.log('🔄 Generando embeddings con Cohere AI API...');
    const conocimientoProcesado = [];
    
    for (const problema of problemas) {
      console.log(`   Procesando: ${problema.titulo} (${problema.id}/${problemas.length})`);
      
      // Determinar categoría
      const categoria = problema.categoria || determinarCategoria(problema.titulo, problema.descripcion);
      
      // Crear texto unificado para embedding
      const descripcionBuscable = `${problema.titulo} - ${problema.descripcion} - ${problema.solucion}`;
      
      // Generar embedding
      const embedding = await generarEmbedding(descripcionBuscable);
      
      // Procesar pasos de resolución
      const pasos = problema.solucion ? problema.solucion.split('.').map(p => p.trim()).filter(p => p) : [];
      
      // Determinar dificultad (basada en longitud de pasos)
      const dificultad = pasos.length <= 2 ? 'baja' : pasos.length <= 4 ? 'media' : 'alta';
      
      // Determinar tiempo estimado (basado en dificultad)
      const tiempoEstimado = {
        'baja': '2-5 minutos',
        'media': '5-15 minutos',
        'alta': '15-30 minutos'
      }[dificultad];
      
      conocimientoProcesado.push({
        id: problema.id,
        titulo: problema.titulo,
        categoria: categoria,
        palabras_clave: problema.palabras_clave || [],
        descripcion_buscable: descripcionBuscable,
        pasos: pasos,
        tiempo_estimado: tiempoEstimado,
        dificultad: dificultad,
        icono: ICONOS[categoria] || '📄',
        embedding: embedding
      });
      
      // Pequeña pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Embeddings generados exitosamente');
    
    // 3. Crear estructura JSON final
    const jsonFinal = {
      version: "1.0",
      ultima_actualizacion: new Date().toISOString().split('T')[0],
      categorias: Object.keys(CATEGORIAS),
      conocimiento: conocimientoProcesado
    };
    
    // 4. Guardar archivo JSON
    const outputPath = path.join(__dirname, '../../data/base-conocimiento-mejorada.json');
    fs.writeFileSync(outputPath, JSON.stringify(jsonFinal, null, 2));
    
    console.log(`💾 Archivo guardado en: ${outputPath}`);
    console.log(`📊 Total de entradas: ${conocimientoProcesado.length}`);
    console.log('✅ Sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar script
sincronizarBaseConocimiento();
