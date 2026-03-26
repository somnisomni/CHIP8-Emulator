import type { EventBusImpl } from "../base/event-bus";
import { MemoryBase } from "../base/memory";
import { Chip8Event, type Chip8EventDetailTypeMap } from "./event-bus";

const memoryRangesProhibited: [number, number][] = [
  [ 0x0000, 0x01FF ], // First 512 bytes were reserved for the original interpreter
];

export class Chip8Memory extends MemoryBase {
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
