const express = require('express');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const { randomUUID } = require('crypto');
const { ObjectId } = require('mongodb');
const cors = require('cors');

// Importar configuraciones y constantes
const { PORT, RABBIT_URL, MONGO_URL, QUEUE_NAMES } = require('./config');
const { SAMPLE_RECIPES } = require('./constants/recipes');
const logger = require('./logger');

const app = express();

// Configurar CORS
app.use(cors({
  origin: '*',  // Permite todos los orígenes - ajustar en producción
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

async function start() {
  // Inicializar logger
  await logger.initLogger();
  await logger.info('Servicio de Cocina iniciado');
  
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db('restaurant');
  const recipesColl = db.collection('recipes');
  
  if (await recipesColl.countDocuments() === 0) {
    await recipesColl.insertMany(SAMPLE_RECIPES);
    await logger.info('Recetas de ejemplo insertadas en la base de datos de Cocina');
  }
  const recipes = await recipesColl.find().toArray();

  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAMES.ORDERS);       
  await channel.assertQueue(QUEUE_NAMES.INGREDIENT_REQUESTS); 
  await channel.assertQueue(QUEUE_NAMES.ORDER_DONE); 

  const replyQueue = await channel.assertQueue('', { exclusive: true });
  const replyQueueName = replyQueue.queue;

  const pendingResponses = {};
  channel.consume(replyQueueName, (msg) => {
    if (msg === null) return;
    const correlationId = msg.properties.correlationId;
    if (correlationId && pendingResponses[correlationId]) {
      pendingResponses[correlationId]();
      delete pendingResponses[correlationId];
    }
    channel.ack(msg);
  });

  const handleOrderMessage = async (orderMsg) => {
    const { orderId } = JSON.parse(orderMsg.content.toString());
    await logger.info(`Pedido ${orderId} recibido en Cocina. Seleccionando receta...`);
    
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    const dishName = recipe.name;
    
    await logger.info(`Preparando "${dishName}" para el pedido ${orderId}. Solicitando ingredientes a Bodega...`);
    
    const ingredientRequest = {
      orderId: orderId,
      ingredients: recipe.ingredients
    };

    const correlationId = randomUUID();
    const responsePromise = new Promise(resolve => {
      pendingResponses[correlationId] = resolve;
    });
    
    channel.sendToQueue(
      QUEUE_NAMES.INGREDIENT_REQUESTS,
      Buffer.from(JSON.stringify(ingredientRequest)),
      { correlationId: correlationId, replyTo: replyQueueName }
    );

    await responsePromise;
    await logger.info(`Ingredientes obtenidos para pedido ${orderId}. Cocinando "${dishName}"...`);
    await logger.info(`Pedido ${orderId} completado. Plato "${dishName}" listo para servir.`);
    
    // Incluir más información del plato en el mensaje de finalización
    const doneMsg = { 
      orderId: orderId, 
      dish: dishName,
      image: recipe.image,
      description: recipe.description
    };
    channel.sendToQueue(QUEUE_NAMES.ORDER_DONE, Buffer.from(JSON.stringify(doneMsg)));
  };

  channel.consume(QUEUE_NAMES.ORDERS, (msg) => {
    if (msg === null) return;
    handleOrderMessage(msg).catch(async err => {
      await logger.error(`Error procesando pedido en Cocina: ${err.message}`, { stack: err.stack });
    }).finally(() => {
      channel.ack(msg);
    });
  });

  app.get('/', async (_req, res) => {
    await logger.info('Endpoint raíz del servicio de cocina accedido');
    res.send('Servicio de Cocina operativo');
  });

  // Endpoint para obtener todas las recetas disponibles
  app.get('/recipes', async (_req, res) => {
    try {
      const allRecipes = await recipesColl.find().toArray();
      await logger.info(`Se consultaron ${allRecipes.length} recetas`);
      res.json(allRecipes);
    } catch (error) {
      await logger.error(`Error al obtener recetas: ${error.message}`, { stack: error.stack });
      res.status(500).send('Error del servidor');
    }
  });

  // Endpoint para obtener una receta específica por su ID
  app.get('/recipes/:id', async (req, res) => {
    try {
      const recipeId = req.params.id;
      const recipe = await recipesColl.findOne({ _id: new ObjectId(recipeId) });
      if (!recipe) {
        await logger.warning(`Receta no encontrada con ID: ${recipeId}`);
        return res.status(404).send('Receta no encontrada');
      }
      await logger.info(`Receta consultada: ${recipe.name} (ID: ${recipeId})`);
      res.json(recipe);
    } catch (error) {
      await logger.error(`Error al obtener receta: ${error.message}`, { recipeId: req.params.id, stack: error.stack });
      res.status(500).send('Error del servidor');
    }
  });

  app.listen(PORT, () => {
    logger.info(`Servicio de Cocina escuchando en puerto ${PORT}`);
  });
}

start().catch(async err => {
  try {
    await logger.error(`Error iniciando el Servicio de Cocina: ${err.message}`, { stack: err.stack });
  } catch (logError) {
    console.error('✘ Error iniciando el Servicio de Cocina:', err);
    console.error('Error adicional al intentar registrar el error:', logError);
  }
  process.exit(1);
});