/**
 * Rutas para búsqueda semántica usando IA
 * 
 * Este módulo proporciona endpoints para buscar soluciones en la base de conocimiento
 * usando embeddings y similitud coseno para encontrar las soluciones más relevantes.
 */

const express = require('express');
const router = express.Router();
const { CohereClient } = require('cohere-ai');
const fs = require('fs');
const path = require('path');

// Configuración de Cohere AI
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY
});

// Cargar base de conocimiento con embeddings
let baseConocimiento = null;
let ultimaCarga = null;

function cargarBaseConocimiento() {
  try {
    const jsonPath = path.join(__dirname, '../../data/base-conocimiento-mejorada.json');
    const data = fs.readFileSync(jsonPath, 'utf8');
    baseConocimiento = JSON.parse(data);
    ultimaCarga = new Date();
    console.log('✅ Base de conocimiento cargada exitosamente');
    console.log(`📊 Total de entradas: ${baseConocimiento.conocimiento.length}`);
  } catch (error) {
    console.error('❌ Error al cargar base de conocimiento:', error);
    baseConocimiento = null;
  }
}

// Cargar al inicio
cargarBaseConocimiento();

// Recargar base de conocimiento (útil después de sincronización)
router.post('/recargar', (req, res) => {
  cargarBaseConocimiento();
  if (baseConocimiento) {
    res.json({ mensaje: 'Base de conocimiento recargada exitosamente', ultima_carga: ultimaCarga });
  } else {
    res.status(500).json({ error: 'Error al recargar base de conocimiento' });
  }
});

// Calcular similitud coseno entre dos vectores
function similitudCoseno(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;
  
  let productoPunto = 0;
  let magnitud1 = 0;
  let magnitud2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    productoPunto += vec1[i] * vec2[i];
    magnitud1 += vec1[i] * vec1[i];
    magnitud2 += vec2[i] * vec2[i];
  }
  
  magnitud1 = Math.sqrt(magnitud1);
  magnitud2 = Math.sqrt(magnitud2);
  
  if (magnitud1 === 0 || magnitud2 === 0) return 0;
  
  return productoPunto / (magnitud1 * magnitud2);
}

// Generar embedding para una consulta
async function generarEmbedding(texto) {
  try {
    const response = await cohere.embed({
      texts: [texto],
      model: 'embed-english-v3.0',
      inputType: 'search_query'
    });
    return response.embeddings[0];
  } catch (error) {
    console.error('Error al generar embedding:', error.message);
    return null;
  }
}

/**
 * POST /api/ai-search/buscar
 * Busca soluciones relevantes en la base de conocimiento
 * 
 * Body:
 * - consulta: Texto del problema del usuario
 * - limite: Número máximo de resultados (default: 3)
 * - categoria: Filtrar por categoría específica (opcional)
 */
router.post('/buscar', async (req, res) => {
  try {
    const { consulta, limite = 3, categoria } = req.body;
    
    if (!consulta) {
      return res.status(400).json({ error: 'Consulta es requerida' });
    }
    
    if (!baseConocimiento) {
      return res.status(500).json({ error: 'Base de conocimiento no disponible' });
    }
    
    console.log(`🔍 Buscando soluciones para: "${consulta}"`);
    
    // Generar embedding de la consulta
    const embeddingConsulta = await generarEmbedding(consulta);
    if (!embeddingConsulta) {
      return res.status(500).json({ error: 'Error al generar embedding de la consulta' });
    }
    
    // Calcular similitud con cada entrada de la base de conocimiento
    const resultados = baseConocimiento.conocimiento
      .filter(entrada => {
        // Filtrar por categoría si se especifica
        if (categoria && entrada.categoria !== categoria) {
          return false;
        }
        // Solo incluir entradas que tengan embedding
        return entrada.embedding && entrada.embedding.length > 0;
      })
      .map(entrada => {
        const similitud = similitudCoseno(embeddingConsulta, entrada.embedding);
        return {
          ...entrada,
          similitud: similitud
        };
      })
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, limite);
    
    // Filtrar resultados con muy baja similitud
    const resultadosFiltrados = resultados.filter(r => r.similitud > 0.4);
    
    console.log(`✅ Se encontraron ${resultadosFiltrados.length} soluciones relevantes`);
    
    res.json({
      consulta: consulta,
      resultados: resultadosFiltrados.map(r => ({
        id: r.id,
        titulo: r.titulo,
        categoria: r.categoria,
        icono: r.icono,
        pasos: r.pasos,
        tiempo_estimado: r.tiempo_estimado,
        dificultad: r.dificultad,
        similitud: Math.round(r.similitud * 100) / 100
      })),
      total: resultadosFiltrados.length
    });
    
  } catch (error) {
    console.error('Error en búsqueda semántica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/ai-search/categorias
 * Obtiene las categorías disponibles en la base de conocimiento
 */
router.get('/categorias', (req, res) => {
  if (!baseConocimiento) {
    return res.status(500).json({ error: 'Base de conocimiento no disponible' });
  }
  
  res.json({
    categorias: baseConocimiento.categorias,
    ultima_actualizacion: baseConocimiento.ultima_actualizacion
  });
});

/**
 * GET /api/ai-search/estado
 * Verifica el estado del servicio de búsqueda
 */
router.get('/estado', (req, res) => {
  res.json({
    disponible: baseConocimiento !== null,
    ultima_carga: ultimaCarga,
    total_entradas: baseConocimiento ? baseConocimiento.conocimiento.length : 0,
    ultima_actualizacion: baseConocimiento ? baseConocimiento.ultima_actualizacion : null
  });
});

module.exports = router;
