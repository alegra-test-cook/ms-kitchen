/**
 * Configuración del Microservicio de Cocina
 */

// Configuración del servidor
const PORT = process.env.PORT || 3002;

// Configuración de la conexión a RabbitMQ
const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Configuración de la conexión a MongoDB
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://heanfig:UBP3AqbGlPWEpdDn@alegra-test.kbne8.mongodb.net/?retryWrites=true&w=majority&appName=alegra-test';

// Nombres de colas
const QUEUE_NAMES = {
  ORDERS: 'orders',
  INGREDIENT_REQUESTS: 'ingredient_requests',
  ORDER_DONE: 'order_done'
};

// Exportar configuraciones
module.exports = {
  PORT,
  RABBIT_URL,
  MONGO_URL,
  QUEUE_NAMES
}; 