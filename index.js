const express = require('express');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3002;
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://heanfig:UBP3AqbGlPWEpdDn@alegra-test.kbne8.mongodb.net/?retryWrites=true&w=majority&appName=alegra-test';

const app = express();
app.use(express.json());

async function start() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db('restaurant');
  const recipesColl = db.collection('recipes');
  
  if (await recipesColl.countDocuments() === 0) {
    const sampleRecipes = [
      { name: "Arroz con Pollo", ingredients: [ { name: "rice", quantity: 2 }, { name: "chicken", quantity: 2 }, { name: "tomato", quantity: 1 }, { name: "onion", quantity: 1 } ] },
      { name: "Ensalada César", ingredients: [ { name: "lettuce", quantity: 2 }, { name: "chicken", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "lemon", quantity: 1 } ] },
      { name: "Puré de Papas con Carne", ingredients: [ { name: "potato", quantity: 3 }, { name: "meat", quantity: 2 }, { name: "onion", quantity: 1 } ] },
      { name: "Risotto de Queso", ingredients: [ { name: "rice", quantity: 2 }, { name: "cheese", quantity: 2 }, { name: "onion", quantity: 1 }, { name: "tomato", quantity: 1 } ] },
      { name: "Hamburguesa con Papas", ingredients: [ { name: "meat", quantity: 1 }, { name: "lettuce", quantity: 1 }, { name: "tomato", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "potato", quantity: 2 }, { name: "ketchup", quantity: 1 } ] },
      { name: "Pollo al Limón", ingredients: [ { name: "chicken", quantity: 2 }, { name: "lemon", quantity: 2 }, { name: "potato", quantity: 2 }, { name: "onion", quantity: 1 } ] }
    ];
    await recipesColl.insertMany(sampleRecipes);
    console.log("ℹ Recetas de ejemplo insertadas en la base de datos de Cocina.");
  }
  const recipes = await recipesColl.find().toArray();

  const connection = await amqp.connect(RABBIT_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue('orders');       
  await channel.assertQueue('ingredient_requests'); 
  await channel.assertQueue('order_done'); 

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
      'ingredient_requests',
      Buffer.from(JSON.stringify(ingredientRequest)),
      { correlationId: correlationId, replyTo: replyQueueName }
    );

    await responsePromise;
    console.log(`✅ Ingredientes obtenidos para pedido ${orderId}. Cocinando "${dishName}"...`);
    console.log(`🍽 Pedido ${orderId} completado. Plato "${dishName}" listo para servir.`);
    const doneMsg = { orderId: orderId, dish: dishName };
    channel.sendToQueue('order_done', Buffer.from(JSON.stringify(doneMsg)));
  };

  channel.consume('orders', (msg) => {
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

  app.listen(PORT, () => {
    console.log(`🚀 Servicio de Cocina escuchando en puerto ${PORT}`);
  });
}

start().catch(err => {
  console.error('✘ Error iniciando el Servicio de Cocina:', err);
  process.exit(1);
});