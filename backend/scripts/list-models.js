require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  console.log('🔍 Probando diferentes modelos de embeddings...\n');
  
  const modelsToTest = [
    "embedding-001",
    "models/embedding-001", 
    "text-embedding-004",
    "models/text-embedding-004",
    "gemini-embedding-model-001",
    "models/gemini-embedding-model-001",
    "gemini-pro",
    "models/gemini-pro"
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`Probando modelo: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent("test");
      console.log(`✅ ${modelName} funciona!`);
      console.log(`   Embedding dimensions: ${result.embedding.values.length}`);
      console.log('---');
      break; // Si funciona, no probar más
    } catch (error) {
      console.log(`❌ ${modelName} falló: ${error.message}`);
      console.log('---');
    }
  }
}

listModels();
