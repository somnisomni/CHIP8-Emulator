import type { DisplayImpl } from "../../base/display";
import type { EventBusImpl } from "../../base/event-bus";
import type { MemoryImpl } from "../../base/memory";
import { Chip8Event, type Chip8EventDetailTypeMap } from "../event-bus";
import { Chip8Opcode } from "./opcodes";
import { Chip8ProcessorRegisters } from "./registers";

export class Chip8Processor {
  /* Parts */
  private readonly registers: Chip8ProcessorRegisters;

  /* Execution status */
  private running: boolean = false;
  public get isRunning(): boolean { return this.running; }

  private cycleCount: number = 0;
  public get totalCyclesExecuted(): number { return this.cycleCount; }

  private lastCycleDuration: number = -1;
  public get currentCycleDuration(): number { return this.lastCycleDuration; }

  private executionLoopId: number | undefined = undefined;
  private timerLoopId: number | undefined = undefined;
  private lastCycleTimestamp: number = -1;

  /* Config */
  private readonly config = {
    programStartAddress: 0x0200,
    targetExecutionFrequency: 250,
    timerFrequency: 60,
  };

  public constructor(
    private readonly memory: MemoryImpl,
    private readonly display: DisplayImpl,
    private readonly eventBus?: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>,
    init: Partial<typeof this.config> = { },
  ) {
    this.config = { ...this.config, ...init };
    this.registers = new Chip8ProcessorRegisters(this.eventBus);

    this.clear();
  }

  public start(): void {
    if(this.running) return;

    this.running = true;
    this.lastCycleTimestamp = performance.now();
    this.eventBus?.emit(Chip8Event.PROCESSOR_START);

    const cycleInterval = 1000 / this.config.targetExecutionFrequency;
    this.executionLoopId = setInterval(() => {
      this.executeCycle();
      this.cycleCount++;
    }, cycleInterval);
    this.timerLoopId = setInterval(() => {
      if(this.registers.delayTimer > 0) {
        this.registers.delayTimer--;
      }

      if(this.registers.soundTimer > 0) {
        this.registers.soundTimer--;
      }
    }, 1000 / this.config.timerFrequency);
  }

  public stop(): void {
    if(!this.running) return;

    clearInterval(this.executionLoopId);
    clearInterval(this.timerLoopId);
    this.executionLoopId = undefined;
    this.timerLoopId = undefined;
    this.running = false;
    this.eventBus?.emit(Chip8Event.PROCESSOR_STOP);
  }

  public dumpRegisters(): ReturnType<Chip8ProcessorRegisters["dumpAll"]> {
    return this.registers.dumpAll();
  }

  public clear(): void {
    this.stop();

    this.registers.clearAll(this.config.programStartAddress);
    this.cycleCount = 0;

    this.eventBus?.emit(Chip8Event.PROCESSOR_CLEAR);
  }

  private executeCycle(): void {
    this.lastCycleDuration = performance.now() - this.lastCycleTimestamp;
    this.lastCycleTimestamp = performance.now();

    // Fetch
    const opcode = this.memory.readWordAt(this.registers.programCounter);
    if(opcode === null || opcode === undefined) {
      return;
    }

    // Decode
    const opData = Chip8Opcode.parseOpcode(opcode);
    if(!opData) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_UNKNOWN_OPCODE, { opcode });
      return;
    }

    // Execute
    if(opData.handle(opcode, this.registers, this.memory, this.display)) {
      // Increment PC (if there's no jump instruction or execution error)
      this.registers.programCounter += 2;
    }
  }
}

export * from "./registers";
