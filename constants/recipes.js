/**
 * Recetas disponibles en el microservicio de cocina
 */

// Colección de recetas con sus ingredientes, imágenes y descripciones
const SAMPLE_RECIPES = [
  { 
    name: "Arroz con Pollo", 
    ingredients: [ { name: "rice", quantity: 2 }, { name: "chicken", quantity: 2 }, { name: "tomato", quantity: 1 }, { name: "onion", quantity: 1 } ],
    image: "https://i0.wp.com/www.pasionthermomix.co/wp-content/uploads/2020/05/arroz-con-pollo.jpg?fit=768%2C480&ssl=1",
    description: "Delicioso arroz cocinado con pollo tierno, tomates frescos y cebolla, un plato tradicional con sabores balanceados y reconfortantes."
  },
  { 
    name: "Ensalada César", 
    ingredients: [ { name: "lettuce", quantity: 2 }, { name: "chicken", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "lemon", quantity: 1 } ],
    image: "https://i0.wp.com/www.pasionthermomix.co/wp-content/uploads/2022/04/caribbean-potato-salad.jpg?resize=600%2C449&ssl=1",
    description: "Ensalada refrescante con lechuga crujiente, pollo a la parrilla, queso rallado y un toque de limón para darle ese sabor cítrico característico."
  },
  { 
    name: "Puré de Papas con Carne", 
    ingredients: [ { name: "potato", quantity: 3 }, { name: "meat", quantity: 2 }, { name: "onion", quantity: 1 } ],
    image: "https://www.recetasnestlecam.com/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/eb77b824c40c515552ac6ea14d673ac1.webp?itok=eAIMKVw8",
    description: "Cremoso puré de papas acompañado de jugosa carne y cebolla caramelizada, una combinación perfecta de texturas y sabores."
  },
  { 
    name: "Risotto de Queso", 
    ingredients: [ { name: "rice", quantity: 2 }, { name: "cheese", quantity: 2 }, { name: "onion", quantity: 1 }, { name: "tomato", quantity: 1 } ],
    image: "https://www.recetasnestlecam.com/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/77483c52700f6b440b0226a1729e5733.webp?itok=0Nh8oM_X",
    description: "Arroz cremoso cocinado lentamente con queso fundido, cebolla y tomate, creando un plato elegante con textura perfecta y sabor intenso."
  },
  { 
    name: "Hamburguesa con Papas", 
    ingredients: [ { name: "meat", quantity: 1 }, { name: "lettuce", quantity: 1 }, { name: "tomato", quantity: 1 }, { name: "cheese", quantity: 1 }, { name: "potato", quantity: 2 }, { name: "ketchup", quantity: 1 } ],
    image: "https://www.recetasnestlecam.com/sites/default/files/styles/recipe_detail_desktop_new/public/oembed_thumbnails/tBzGjA51GC4V284vXJz698Cv4pBfiXV5xcPF6GkqRxI.webp?itok=r3E3AuoT",
    description: "Hamburguesa casera con carne jugosa, lechuga fresca, tomate, queso derretido y ketchup, acompañada de crujientes papas fritas."
  },
  { 
    name: "Pollo al Limón", 
    ingredients: [ { name: "chicken", quantity: 2 }, { name: "lemon", quantity: 2 }, { name: "potato", quantity: 2 }, { name: "onion", quantity: 1 } ],
    image: "https://www.recetasnestlecam.com/sites/default/files/styles/recipe_detail_desktop_new/public/srh_recipes/513093d68f8203675fa728b49b983dc8.webp?itok=lg0bf-Iy",
    description: "Pollo tierno cocinado con limón fresco, acompañado de papas y cebolla, un plato ligero con un equilibrio perfecto entre sabores cítricos y aromáticos."
  }
];

// Exportar las recetas
module.exports = {
  SAMPLE_RECIPES
}; 