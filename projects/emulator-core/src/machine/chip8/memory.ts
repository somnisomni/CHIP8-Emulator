import { MemoryBase } from "../base/memory";
import { Chip8Event, type Chip8EventBus } from "./event-bus";

const memoryRangesProhibited: [number, number][] = [
  [ 0x0000, 0x01FF ], // First 512 bytes were reserved for the original interpreter
];

export class Chip8Memory extends MemoryBase {
  public constructor(
    private readonly eventBus?: Chip8EventBus,
    size: number = 4096,
  ) {
    super(size);
  }

  public override readAt(address: number, ignoreProhibited: boolean = false): number {
    if(!ignoreProhibited && this.isAddressProhibited(address)) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_PROHIBITED, address);
      return -1;
    }

    const value = super.readAt(address);

    if(value <= -1 || value === undefined) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_OUT_OF_BOUNDS, address);
      return -1;
    }

    this.eventBus?.emit(Chip8Event.MEMORY_READ, { address, value });
    return value;
  }

  public override writeAt(address: number, value: number, ignoreProhibited: boolean = false): void {
    if(!ignoreProhibited && this.isAddressProhibited(address)) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_PROHIBITED, address);
      return;
    }

    if(address >= this.memory.length) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_OUT_OF_BOUNDS, address);
      return;
    }

    if(value < 0 || value > 255) {
      this.eventBus?.emit(Chip8Event.MEMORY_ERROR_WRITE_INVALID_VALUE, { address, value });
      return;
    }

    super.writeAt(address, value);
    this.eventBus?.emit(Chip8Event.MEMORY_WRITE, { address, value });
  }

  public override writeRange(startAddress: number, values: Uint8Array): void {
    this.eventBus?.emit(Chip8Event.MEMORY_WRITE_RANGE_START, { startAddress, length: values.length });

    for(let offset = 0; offset < values.length; offset++) {
      const addr = startAddress + offset;
      const value = values[offset];

      this.writeAt(addr, value ?? -1);
    }

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
