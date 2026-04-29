import { Routes, Route } from 'react-router';
import Splash from '@/pages/Splash';
import Onboarding from '@/pages/Onboarding';
import Camera from '@/pages/Camera';
import Analysis from '@/pages/Analysis';
import RobotControl from '@/pages/RobotControl';
import Impact from '@/pages/Impact';
import Summary from '@/pages/Summary';
import TeacherDashboard from '@/pages/TeacherDashboard';
import Game from '@/pages/Game';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/camera" element={<Camera />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/robot" element={<RobotControl />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/summary" element={<Summary />} />
      <Route path="/game" element={<Game />} />
      <Route path="/dashboard" element={<TeacherDashboard />} />
    </Routes>
  );
}