import type { EventBusLogHandler } from "../base/event-bus";
import type { KeyboardImpl } from "../base/keyboard";
import type { MemoryImpl } from "../base/memory";
import { Chip8EventBus } from "./event-bus";
import { Chip8Keyboard } from "./keyboard";
import { Chip8Memory } from "./memory";
import { Chip8Processor } from "./processor";

export class Chip8Machine {
  private readonly eventBus;

  public readonly memory: MemoryImpl;
  public readonly processor: Chip8Processor;
  public readonly keyboard: KeyboardImpl;

  public constructor(config?: {
    hardwareOverrides?: {
      processor?: Chip8Processor;
      memory?: MemoryImpl;
      keyboard?: KeyboardImpl;
    },
    eventBusLogger?: EventBusLogHandler,
  }) {
    this.eventBus = new Chip8EventBus(config?.eventBusLogger);
    this.memory = config?.hardwareOverrides?.memory || new Chip8Memory(this.eventBus);
    this.processor = config?.hardwareOverrides?.processor || new Chip8Processor(this.memory, this.eventBus);
    this.keyboard = config?.hardwareOverrides?.keyboard || new Chip8Keyboard(this.eventBus);
  }

  public loadProgram(program: Uint8Array): void {
    this.memory.writeRange(0x0200, program);
  }
}

export * from "./keyboard";
export * from "./memory";
export * from "./event-bus";
export * from "./processor";
