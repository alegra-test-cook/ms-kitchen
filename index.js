const express = require('express');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const { randomUUID } = require('crypto');
const { ObjectId } = require('mongodb');

// Importar configuraciones y constantes
const { PORT, RABBIT_URL, MONGO_URL, QUEUE_NAMES } = require('./config');
const { SAMPLE_RECIPES } = require('./constants/recipes');

const app = express();
app.use(express.json());

async function start() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db('restaurant');
  const recipesColl = db.collection('recipes');
  
  if (await recipesColl.countDocuments() === 0) {
    await recipesColl.insertMany(SAMPLE_RECIPES);
    console.log("ℹ Recetas de ejemplo insertadas en la base de datos de Cocina.");
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
    console.log(`👩‍🍳 Pedido ${orderId} recibido en Cocina. Seleccionando receta...`);
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    const dishName = recipe.name;
    console.log(`🥘 Preparando "${dishName}" para el pedido ${orderId}. Solicitando ingredientes a Bodega...`);
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
    console.log(`✅ Ingredientes obtenidos para pedido ${orderId}. Cocinando "${dishName}"...`);
    console.log(`🍽 Pedido ${orderId} completado. Plato "${dishName}" listo para servir.`);
    
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
    handleOrderMessage(msg).catch(err => {
      console.error("✘ Error procesando pedido en Cocina:", err);
    }).finally(() => {
      channel.ack(msg);
    });
  });

  app.get('/', (_req, res) => {
    res.send('Servicio de Cocina operativo');
  });

  // Endpoint para obtener todas las recetas disponibles
  app.get('/recipes', async (_req, res) => {
    try {
      const allRecipes = await recipesColl.find().toArray();
      res.json(allRecipes);
    } catch (error) {
      console.error('✘ Error al obtener recetas:', error);
      res.status(500).send('Error del servidor');
    }
  });

  // Endpoint para obtener una receta específica por su ID
  app.get('/recipes/:id', async (req, res) => {
    try {
      const recipeId = req.params.id;
      const recipe = await recipesColl.findOne({ _id: new ObjectId(recipeId) });
      if (!recipe) {
        return res.status(404).send('Receta no encontrada');
      }
      res.json(recipe);
    } catch (error) {
      console.error('✘ Error al obtener receta:', error);
      res.status(500).send('Error del servidor');
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Servicio de Cocina escuchando en puerto ${PORT}`);
  });
}

start().catch(err => {
  console.error('✘ Error iniciando el Servicio de Cocina:', err);
  process.exit(1);
});