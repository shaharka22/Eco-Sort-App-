import type { WasteCategory } from '@/types';

const COLORS: Record<WasteCategory, string> = {
  plastic: 'ORANGE',
  paper: 'BLUE',
  glass: 'PURPLE',
  organic: 'GREEN',
};

class MockRobotAPI {
  private isMoving = false;
  private listeners: ((status: string) => void)[] = [];

  private log(command: string) {
    console.log(`%c🤖 ROBOT COMMAND: ${command}`, 'color: #22C55E; font-weight: bold; font-size: 14px;');
    this.notifyListeners(command);
  }

  subscribe(callback: (status: string) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(status: string) {
    this.listeners.forEach(l => l(status));
  }

  async scanItem(): Promise<void> {
    this.log('SCAN_ITEM');
    await this.delay(500);
  }

  async moveToBin(category: WasteCategory): Promise<void> {
    if (this.isMoving) { console.warn('Robot is already moving!'); return; }
    this.isMoving = true;
    this.log(`MOVE_TO_BIN_${COLORS[category]}`);
    await this.delay(2000);
    this.isMoving = false;
  }

  async gripItem(): Promise<void> {
    this.log('GRIP_ITEM');
    await this.delay(800);
  }

  async releaseGripper(): Promise<void> {
    this.log('RELEASE_GRIPPER');
    await this.delay(500);
  }

  emergencyStop(): void {
    this.log('⚠️ EMERGENCY_STOP ⚠️');
    this.isMoving = false;
  }

  async executeFullSequence(category: WasteCategory): Promise<boolean> {
    try {
      this.log('SEQUENCE_START');
      await this.gripItem();
      await this.moveToBin(category);
      await this.releaseGripper();
      this.log('SEQUENCE_COMPLETE');
      return true;
    } catch (error) {
      this.log('SEQUENCE_ERROR');
      return false;
    }
  }

  moveArm(direction: 'up' | 'down' | 'left' | 'right'): void {
    this.log(`MANUAL_MOVE_${direction.toUpperCase()}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const robotAPI = new MockRobotAPI();
