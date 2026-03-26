import type { EventBusImpl } from "../base/event-bus";
import { MemoryBase } from "../base/memory";
import { Chip8Event, type Chip8EventDetailTypeMap } from "./event-bus";

const memoryRangesProhibited: [number, number][] = [
  [ 0x0000, 0x01FF ], // First 512 bytes were reserved for the original interpreter
];

export class Chip8Memory extends MemoryBase {
  protected override readonly memoryInitMap: Record<number, number[]> = {
    // Predefined digit sprites at 0x1B0 ~ 0x1FF, each sprite is 5 bytes long
    0x1B0: [ 0xF0, 0x90, 0x90, 0x90, 0xF0 ],  // Digit sprite 0
    0x1B5: [ 0x20, 0x60, 0x20, 0x20, 0x70 ],  // Digit sprite 1
    0x1BA: [ 0xF0, 0x10, 0xF0, 0x80, 0xF0 ],  // Digit sprite 2
    0x1BF: [ 0xF0, 0x10, 0xF0, 0x10, 0xF0 ],  // Digit sprite 3
    0x1C4: [ 0x90, 0x90, 0xF0, 0x10, 0x10 ],  // Digit sprite 4
    0x1C9: [ 0xF0, 0x80, 0xF0, 0x10, 0xF0 ],  // Digit sprite 5
    0x1CE: [ 0xF0, 0x80, 0xF0, 0x90, 0xF0 ],  // Digit sprite 6
    0x1D3: [ 0xF0, 0x10, 0x20, 0x40, 0x40 ],  // Digit sprite 7
    0x1D8: [ 0xF0, 0x90, 0xF0, 0x90, 0xF0 ],  // Digit sprite 8
    0x1DD: [ 0xF0, 0x90, 0xF0, 0x10, 0xF0 ],  // Digit sprite 9
    0x1E2: [ 0xF0, 0x90, 0xF0, 0x90, 0x90 ],  // Digit sprite A
    0x1E7: [ 0xE0, 0x90, 0xE0, 0x90, 0xE0 ],  // Digit sprite B
    0x1EC: [ 0xF0, 0x80, 0x80, 0x80, 0x80 ],  // Digit sprite C
    0x1F1: [ 0xE0, 0x90, 0x90, 0x90, 0xE0 ],  // Digit sprite D
    0x1F6: [ 0xF0, 0x80, 0xF0, 0x80, 0xF0 ],  // Digit sprite E
    0x1FB: [ 0xF0, 0x80, 0xF0, 0x80, 0x80 ],  // Digit sprite F
  };

  public constructor(
    private readonly eventBus?: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>,
    size: number = 4096,
  ) {
    super(size);
  }

  public override readAt(address: number, ignoreProhibited: boolean = false): number | null {
    if(!ignoreProhibited && this.isAddressProhibited(address)) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_PROHIBITED, { address });
      this.eventBus?.emit(Chip8Event.PANIC);
      return null;
    }

    const value = super.readAt(address);

    if(value === null || value === undefined) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_OUT_OF_BOUNDS, { address });
      this.eventBus?.emit(Chip8Event.PANIC);
      return null;
    }

    this.eventBus?.emit(Chip8Event.MEMORY_READ, { address, value });
    return value;
  }

  public override writeAt(address: number, value: number, ignoreProhibited: boolean = false): void {
    if(!ignoreProhibited && this.isAddressProhibited(address)) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_PROHIBITED, { address });
      this.eventBus?.emit(Chip8Event.PANIC);
      return;
    }

    if(address >= this.memory.length) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_OUT_OF_BOUNDS, { address });
      this.eventBus?.emit(Chip8Event.PANIC);
      return;
    }

    if(value < 0 || value > 255) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_WRITE_INVALID_VALUE, { address, attemptedValue: value });
      return;
    }

    super.writeAt(address, value);
    this.eventBus?.emit(Chip8Event.MEMORY_WRITE, { address, value });
  }

  public override writeRange(startAddress: number, values: Uint8Array): void {
    this.eventBus?.emit(Chip8Event.MEMORY_WRITE_RANGE_START, { startAddress, length: values.length });

    super.writeRange(startAddress, values);

    this.eventBus?.emit(Chip8Event.MEMORY_WRITE_RANGE_END, { startAddress, length: values.length });
  }

  public override clear(): void {
    super.clear();
    this.eventBus?.emit(Chip8Event.MEMORY_CLEAR);
  }

  private isAddressProhibited(address: number): boolean {
    return memoryRangesProhibited.some(([ start, end ]) => address >= start && address <= end);
  }
}
