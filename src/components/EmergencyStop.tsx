import { Octagon, Hand } from 'lucide-react';
import { robotAPI } from '@/utils/MockRobotAPI';

interface EmergencyStopProps {
  onStop?: () => void;
}

export function EmergencyStop({ onStop }: EmergencyStopProps) {
  const handleStop = () => {
    robotAPI.emergencyStop();
    onStop?.();
  };

  return (
    <button
      onClick={handleStop}
      className="
        w-full py-3 px-8
        bg-gradient-to-b from-destructive to-destructive-dark
        from-red-600 hover:to-red-700
        active:from-red-700 active:to-red-800
        rounded-2xl shadow-lg
        flex items-center justify-center gap-4
        transition-all duration-150
        active:scale-95
        border-4 border-red-300
      ">
      <div className="relative">
        <Octagon size={36} className="text-white" fill="currentColor" />
        <Hand size={18} className="text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <span className="text-white text-2xl font-black tracking-wide">STOP</span>
    </button>
  );
}