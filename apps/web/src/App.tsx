import { Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@generalstaff/ui-components';
import Layout from './components/Layout';
import DivisionDesigner from './pages/DivisionDesigner';
import TankDesigner from './pages/TankDesigner';
import NavyDesigner from './pages/NavyDesigner';
import AirDesigner from './pages/AirDesigner';
import Analysis from './pages/Analysis';

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DivisionDesigner />} />
          <Route path="tank" element={<TankDesigner />} />
          <Route path="navy" element={<NavyDesigner />} />
          <Route path="air" element={<AirDesigner />} />
          <Route path="analysis" element={<Analysis />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}

export default App;