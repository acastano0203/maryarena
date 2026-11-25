export const KEY = 'mya-app-v1';
export const SKEY = 'mya-session';

export const ROLE = { admin: 'Administrador · Caja', mesero: 'Mesero', domi: 'Domiciliario' };
export const HOME = { admin: 'tablero', mesero: 'mesas', domi: 'entregas' };
export const ALLOW = {
  admin: ['tablero', 'mesas', 'pedido', 'cobrar', 'whatsapp', 'domicilios', 'usuarios', 'gastos', 'cierre', 'menu'],
  mesero: ['mesas', 'pedido'],
  domi: ['entregas'],
};

export const FISH = ['Mojarra', 'Sierra', 'Bocachico', 'Bagre', 'Trucha', 'Chuleta', 'Lebranche'];
export const TAGS = ['Sin cebolla', 'Bien frito', 'Sin sal', 'Salsa aparte', 'Para llevar'];
export const METHODS = ['Efectivo', 'Nequi', 'Daviplata', 'Tarjeta', 'Transferencia'];
export const ECATS = ['Insumos / pescado', 'Gas', 'Nómina', 'Servicios', 'Otros'];
export const ST = {
  libre: ['Libre', 'st-libre'],
  ocupada: ['Ocupada', 'st-ocupada'],
  cocina: ['En cocina', 'st-cocina'],
  cobrar: ['Para cobrar', 'st-cobrar'],
};

export const CATS = [
  { id: 'cev', name: 'Ceviches', sz: ['Pequeño', 'Grande'] },
  { id: 'alm', name: 'Almuerzos' },
  { id: 'esp', name: 'Especialidades', sz: ['Medio', 'Entero'] },
  { id: 'arr', name: 'Arroces', sz: ['Pequeño', 'Grande'] },
  { id: 'caz', name: 'Cazuelas', sz: ['Media', 'Entera'] },
  { id: 'pes', name: 'Pescados' },
  { id: 'sal', name: 'Salmón' },
  { id: 'cre', name: 'Cremas' },
  { id: 'pat', name: 'Patacón y Arepas' },
  { id: 'car', name: 'Carnes' },
  { id: 'adi', name: 'Adicionales' },
  { id: 'beb', name: 'Bebidas' },
];

const CRA = 'Caldo, arroz, patacón y ensalada';

// [nombre, precio pequeño (miles) | null, precio grande/único (miles), descripción]
export const RAW = {
  cev: [['Ceviche de Camarón', 20, 27, 'Solo camarón'], ['Ceviche de Camarón con Langostinos', null, 35, 'Camarón y 2 langostinos · solo grande'], ['Ceviche Bomba', 20, 27, 'Camarón, calamar, caracol y pulpo'], ['Ceviche Bomba con Langostinos', null, 35, 'Camarón, calamar, caracol, pulpo y 2 langostinos'], ['Ceviche Mixto', 20, 27, 'Camarón y calamar, o camarón y pulpo']],
  alm: [['Almuerzo de pescado', null, 20, 'Frito o sudado, con arroz, patacón, ensalada, limonada y caldo'], ['Caldo Sencillo', null, 8, ''], ['Caldo Peligroso', null, 10, '']],
  esp: [['Espagueti Camarón', 22, 30, 'Patacón, caldo y limonada'], ['Espagueti Marinera', 22, 30, 'Patacón, caldo y limonada'], ['Bandeja Caribeña', null, 33, 'Mariscos en salsa, posta de pescado frito, caldo, arroz, patacón y ensalada'], ['Bandeja Viña del Mar', null, 40, '1/2 langosta rellena en salsa de mariscos, caldo, arroz, patacón y ensalada'], ['Bandeja Burro Mocho', null, 33, 'Espagueti marinera, arroz marinera, posta frita, caldo y patacón'], ['Burro Mocho Camarón', null, 35, 'Arroz camarón, espagueti camarón, posta frita, caldo y patacón'], ['Burro Mocho Coco Marinera', null, 35, 'Arroz marinera coco, espagueti marinera, posta frita, caldo y patacón'], ['Burro Mocho Coco Camarón', null, 35, 'Arroz camarón coco, espagueti camarón, posta frita, caldo y patacón'], ['Langosta Rellena', null, 60, CRA], ['Langosta al Ajillo', null, 60, CRA], ['Langostinos Apanados', null, 39, CRA], ['Langostinos al Ajillo', null, 39, CRA], ['Camarones al Ajillo', null, 30, CRA], ['Camarones Apanados', null, 30, CRA], ['Camarones Gratinados', null, 33, CRA]],
  arr: [['Arroz con Camarón', 22, 30, 'Caldo, patacón y ensalada'], ['Arroz a la Marinera', 22, 30, 'Caldo, patacón y ensalada'], ['Arroz Coco Camarón', 25, 33, 'Caldo, patacón y ensalada'], ['Arroz a la Marinera Coco', 25, 33, 'Caldo, patacón y ensalada'], ['Arroz a la Marinera con Langostino', 26, 38, 'Caldo, patacón y ensalada'], ['Paella Marinera', 27, 47, '1/2 langosta, posta de pescado frito, palmitos, mejillones'], ['Arroz Teriyaki', null, 30, 'Solo grande']],
  caz: [['Cazuela de Camarones', 25, 30, 'Arroz, ensalada y patacón'], ['Cazuela de Mariscos', 25, 30, 'Arroz, ensalada y patacón'], ['Cazuela de Langostinos', null, 38, 'Solo entera'], ['Cazuela de Pescado', null, 30, 'Solo entera'], ['Cazuela Mixta', null, 30, 'Solo entera']],
  pes: [['Pescado Frito', null, 30, CRA], ['Sancocho de Pescado', null, 30, 'Arroz, patacón y ensalada'], ['Viudo de Pescado', null, 30, 'En salsa criolla con plátano y papa'], ['Chuleta de Pescado', null, 30, CRA], ['Pescado en Verduras', null, 35, CRA], ['Pescado en Champiñones', null, 35, CRA], ['Pargo Rojo / Róbalo', null, 30, CRA], ['Pescado Frito en Salsa Criolla', null, 30, CRA], ['Pescado a la Plancha', null, 35, CRA], ['Pescado al Ajillo', null, 35, CRA], ['Pescado en Salsa Marinera', null, 45, 'En salsa de mariscos'], ['Pescado en Salsa de Camarón', null, 45, CRA], ['Pescado en Salsa Teriyaki', null, 40, CRA], ['Trucha Gratinada', null, 40, CRA]],
  sal: [['Salmón al Ajillo', null, 35, CRA], ['Salmón en Salsa Marinera', null, 45, CRA], ['Salmón en Salsa Teriyaki', null, 40, CRA], ['Salmón a la Plancha', null, 35, CRA], ['Salmón en Salsa de Camarones', null, 45, CRA], ['Salmón en Salsa de Champiñones', null, 40, CRA], ['Salmón Miel Mostaza', null, 40, CRA], ['Salmón en Salsa de la Casa', null, 40, CRA]],
  cre: [['Crema de Pescado', null, 30, 'Arroz, ensalada y patacón'], ['Crema de Camarón', null, 30, 'Arroz, ensalada y patacón']],
  pat: [['Patacón Camarón o Marinera', null, 27, 'Incluye caldo y limonada']],
  car: [['Carne Asada de Res', null, 27, 'Arroz, ensalada y patacón o papas'], ['Chuleta de Cerdo', null, 26, 'Arroz, ensalada y patacón o papas'], ['Chuleta de Pollo', null, 26, 'Arroz, ensalada y patacón o papas']],
  adi: [['Porción de Arroz Blanco', null, 4, ''], ['Porción de Arroz Coco', null, 5, ''], ['Porción de Patacón', null, 4, ''], ['Porción de Ensalada', null, 4, ''], ['Porción de Papas a la Francesa', null, 6, '']],
  beb: [['Jugo Natural en Agua', null, 6, ''], ['Jugo Natural en Leche', null, 10, ''], ['Gaseosa', null, 5, ''], ['Jugos del Valle', null, 5, ''], ['Botella de Agua', null, 4, ''], ['Cerveza Póker / Costeña', null, 5, ''], ['Cerveza Club Colombia / Águila Light', null, 5, ''], ['Limonada Natural', null, 6, ''], ['Limonada Natural Jarra', null, 12, ''], ['Limonada de Panela', null, 3, ''], ['Limonada de Panela Jarra', null, 10, '']],
};

export const SAMPLE = '2 ceviche bomba grande\n1 almuerzo sierra frita con arroz coco\n1 limonada jarra\n1 cazuela langost.\n2 cocacola';
