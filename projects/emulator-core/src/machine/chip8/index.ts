import type { EventBusImpl, EventBusLogHandler } from "../base/event-bus";
import type { KeyboardImpl } from "../base/keyboard";
import type { MemoryImpl } from "../base/memory";
import { Chip8Display } from "./display";
import { Chip8Event, Chip8EventBus, type Chip8EventDetailTypeMap } from "./event-bus";
import { Chip8Keyboard } from "./keyboard";
import { Chip8Memory } from "./memory";
import { Chip8Processor } from "./processor";

export class Chip8Machine {
  /* Parts */
  public readonly eventBus: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>;
  public readonly memory: MemoryImpl;
  public readonly keyboard: KeyboardImpl;
  public readonly display: Chip8Display;
  public readonly processor: Chip8Processor;

  public constructor(init?: {
    hardwareOverrides?: {
      processor?: Chip8Processor;
      memory?: MemoryImpl;
      keyboard?: KeyboardImpl;
      display?: Chip8Display;
    },
    eventBusLogger?: EventBusLogHandler,
  }) {
    this.eventBus = new Chip8EventBus(init?.eventBusLogger);
    this.memory = init?.hardwareOverrides?.memory || new Chip8Memory(this.eventBus);
    this.keyboard = init?.hardwareOverrides?.keyboard || new Chip8Keyboard(this.eventBus);
    this.display = init?.hardwareOverrides?.display || new Chip8Display(this.eventBus);
    this.processor = init?.hardwareOverrides?.processor || new Chip8Processor(this.memory, this.display, this.eventBus);

    this.eventBus.subscribe(Chip8Event.PANIC, () => {
      this.processor.stop();
    });
  }

  public loadProgram(program: Uint8Array, loadAddress: number = 0x0200): void {
    this.clear();
    this.memory.writeRange(loadAddress, program);
  }

  public clear(): void {
    this.processor.clear();
    this.memory.clear();
    this.display.clear();
    this.keyboard.clear();
  }
}

export * from "./keyboard";
export * from "./memory";
export * from "./event-bus";
export * from "./processor";
