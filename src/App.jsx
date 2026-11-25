import { useApp } from './store/AppContext';
import { ALLOW, HOME } from './lib/constants';
import Login from './views/Login';
import Mesas from './views/Mesas';
import Pedido from './views/Pedido';
import Tablero from './views/Tablero';
import Cobrar from './views/Cobrar';
import WhatsApp from './views/WhatsApp';
import Domicilios from './views/Domicilios';
import Entregas from './views/Entregas';
import Usuarios from './views/Usuarios';
import Gastos from './views/Gastos';
import Cierre from './views/Cierre';
import MenuAdmin from './views/MenuAdmin';

const VIEWS = { tablero: Tablero, mesas: Mesas, pedido: Pedido, cobrar: Cobrar, whatsapp: WhatsApp, domicilios: Domicilios, entregas: Entregas, usuarios: Usuarios, gastos: Gastos, cierre: Cierre, menu: MenuAdmin };

export default function App() {
  const { user, route } = useApp();
  if (!user) return <Login />;
  let name = route.name;
  if (!ALLOW[user.role].includes(name) || !VIEWS[name]) name = HOME[user.role];
  const View = VIEWS[name];
  return <View key={name + '-' + (route.arg || '')} arg={route.arg} />;
}
