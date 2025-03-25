/**
 * Recetas disponibles en el microservicio de cocina
 */

// Colección de recetas con sus ingredientes, imágenes y descripciones
const SAMPLE_RECIPES = [
  { 
    name: "Arroz con Pollo", 
    ingredients: [ { name: "rice", quantity: 2 }, { name: "chicken", quantity: 2 }, { name: "tomato", quantity: 1 }, { name: "onion", quantity: 1 } ],
    image: "https://i.imgur.com/YDGqoPC.jpg",
    description: "Delicioso arroz cocinado con pollo tierno, tomates frescos y cebolla, un plato tradicional con sabores balanceados y reconfortantes."
  },
  { 
    name: "Ensalada César", 
    ingredients: [ { name: "lettuce", quantity: 2 }, { name: "chicken", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "lemon", quantity: 1 } ],
    image: "https://i.imgur.com/0AUxzol.jpg",
    description: "Ensalada refrescante con lechuga crujiente, pollo a la parrilla, queso rallado y un toque de limón para darle ese sabor cítrico característico."
  },
  { 
    name: "Puré de Papas con Carne", 
    ingredients: [ { name: "potato", quantity: 3 }, { name: "meat", quantity: 2 }, { name: "onion", quantity: 1 } ],
    image: "https://i.imgur.com/1uA92rU.jpg",
    description: "Cremoso puré de papas acompañado de jugosa carne y cebolla caramelizada, una combinación perfecta de texturas y sabores."
  },
  { 
    name: "Risotto de Queso", 
    ingredients: [ { name: "rice", quantity: 2 }, { name: "cheese", quantity: 2 }, { name: "onion", quantity: 1 }, { name: "tomato", quantity: 1 } ],
    image: "https://i.imgur.com/NaEX8Jw.jpg",
    description: "Arroz cremoso cocinado lentamente con queso fundido, cebolla y tomate, creando un plato elegante con textura perfecta y sabor intenso."
  },
  { 
    name: "Hamburguesa con Papas", 
    ingredients: [ { name: "meat", quantity: 1 }, { name: "lettuce", quantity: 1 }, { name: "tomato", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "potato", quantity: 2 }, { name: "ketchup", quantity: 1 } ],
    image: "https://i.imgur.com/KiUPIhj.jpg",
    description: "Hamburguesa casera con carne jugosa, lechuga fresca, tomate, queso derretido y ketchup, acompañada de crujientes papas fritas."
  },
  { 
    name: "Pollo al Limón", 
    ingredients: [ { name: "chicken", quantity: 2 }, { name: "lemon", quantity: 2 }, { name: "potato", quantity: 2 }, { name: "onion", quantity: 1 } ],
    image: "https://i.imgur.com/Yf4vtbC.jpg",
    description: "Pollo tierno cocinado con limón fresco, acompañado de papas y cebolla, un plato ligero con un equilibrio perfecto entre sabores cítricos y aromáticos."
  }
];

// Exportar las recetas
module.exports = {
  SAMPLE_RECIPES
}; 