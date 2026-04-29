import { useState, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Grip } from 'lucide-react';
import { robotAPI } from '@/utils/MockRobotAPI';

interface VirtualJoystickProps {
  disabled?: boolean;
}

export function VirtualJoystick({ disabled = false }: VirtualJoystickProps) {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const handleDirectionStart = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (disabled) return;
    setActiveDirection(direction);
    robotAPI.moveArm(direction);
    intervalRef.current = window.setInterval(() => {
      robotAPI.moveArm(direction);
    }, 200);
  };

  const handleDirectionEnd = () => {
    setActiveDirection(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const DirectionButton = ({ direction, icon: Icon }: { direction: 'up' | 'down' | 'left' | 'right'; icon: typeof ArrowUp }) => (
    <button
      onMouseDown={() => handleDirectionStart(direction)}
      onMouseUp={handleDirectionEnd}
      onMouseLeave={handleDirectionEnd}
      onTouchStart={() => handleDirectionStart(direction)}
      onTouchEnd={handleDirectionEnd}
      disabled={disabled}
      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-100
        ${activeDirection === direction ? 'bg-primary text-white scale-95' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-90'}`}>
      <Icon size={28} />
    </button>
  );

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
      <DirectionButton direction="up" icon={ArrowUp} />
      <div className="flex gap-2">
        <DirectionButton direction="left" icon={ArrowLeft} />
        <div className="w-14 h-14 rounded-xl bg-gray-300 flex items-center justify-center">
          <Grip size={24} className="text-gray-500" />
        </div>
        <DirectionButton direction="right" icon={ArrowRight} />
      </div>
      <DirectionButton direction="down" icon={ArrowDown} />
    </div>
  );
}