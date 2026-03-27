import type { EventBusImpl } from "../base/event-bus";
import { MemoryBase } from "../base/memory";
import { Chip8Event, type Chip8EventDetailTypeMap } from "./event-bus";

const memoryRangesProhibited: [number, number][] = [
  [ 0x0000, 0x01FF ], // First 512 bytes were reserved for the original interpreter
];

export class Chip8Memory extends MemoryBase {
  public static fontSpriteAddrMap = Object.freeze({
    0x0: 0x1B0,
    0x1: 0x1B5,
    0x2: 0x1BA,
    0x3: 0x1BF,
    0x4: 0x1C4,
    0x5: 0x1C9,
    0x6: 0x1CE,
    0x7: 0x1D3,
    0x8: 0x1D8,
    0x9: 0x1DD,
    0xA: 0x1E2,
    0xB: 0x1E7,
    0xC: 0x1EC,
    0xD: 0x1F1,
    0xE: 0x1F6,
    0xF: 0x1FB,
  } as const);

  protected override readonly memoryInitMap: Record<number, number[]> = {
    // Predefined digit sprites at 0x1B0 ~ 0x1FF, each sprite is 5 bytes long
    [Chip8Memory.fontSpriteAddrMap[0x0]]: [ 0xF0, 0x90, 0x90, 0x90, 0xF0 ],  // Digit sprite 0
    [Chip8Memory.fontSpriteAddrMap[0x1]]: [ 0x20, 0x60, 0x20, 0x20, 0x70 ],  // Digit sprite 1
    [Chip8Memory.fontSpriteAddrMap[0x2]]: [ 0xF0, 0x10, 0xF0, 0x80, 0xF0 ],  // Digit sprite 2
    [Chip8Memory.fontSpriteAddrMap[0x3]]: [ 0xF0, 0x10, 0xF0, 0x10, 0xF0 ],  // Digit sprite 3
    [Chip8Memory.fontSpriteAddrMap[0x4]]: [ 0x90, 0x90, 0xF0, 0x10, 0x10 ],  // Digit sprite 4
    [Chip8Memory.fontSpriteAddrMap[0x5]]: [ 0xF0, 0x80, 0xF0, 0x10, 0xF0 ],  // Digit sprite 5
    [Chip8Memory.fontSpriteAddrMap[0x6]]: [ 0xF0, 0x80, 0xF0, 0x90, 0xF0 ],  // Digit sprite 6
    [Chip8Memory.fontSpriteAddrMap[0x7]]: [ 0xF0, 0x10, 0x20, 0x40, 0x40 ],  // Digit sprite 7
    [Chip8Memory.fontSpriteAddrMap[0x8]]: [ 0xF0, 0x90, 0xF0, 0x90, 0xF0 ],  // Digit sprite 8
    [Chip8Memory.fontSpriteAddrMap[0x9]]: [ 0xF0, 0x90, 0xF0, 0x10, 0xF0 ],  // Digit sprite 9
    [Chip8Memory.fontSpriteAddrMap[0xA]]: [ 0xF0, 0x90, 0xF0, 0x90, 0x90 ],  // Digit sprite A
    [Chip8Memory.fontSpriteAddrMap[0xB]]: [ 0xE0, 0x90, 0xE0, 0x90, 0xE0 ],  // Digit sprite B
    [Chip8Memory.fontSpriteAddrMap[0xC]]: [ 0xF0, 0x80, 0x80, 0x80, 0xF0 ],  // Digit sprite C
    [Chip8Memory.fontSpriteAddrMap[0xD]]: [ 0xE0, 0x90, 0x90, 0x90, 0xE0 ],  // Digit sprite D
    [Chip8Memory.fontSpriteAddrMap[0xE]]: [ 0xF0, 0x80, 0xF0, 0x80, 0xF0 ],  // Digit sprite E
    [Chip8Memory.fontSpriteAddrMap[0xF]]: [ 0xF0, 0x80, 0xF0, 0x80, 0x80 ],  // Digit sprite F
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
