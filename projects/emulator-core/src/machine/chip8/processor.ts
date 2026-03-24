import type { MemoryImpl } from "../base/memory";
import { Chip8Event, type Chip8EventBus } from "./event-bus";

export class Chip8Processor {
  /** General purpose registers (V0 ~ VF) */
  private readonly registerGeneral: Uint8Array = new Uint8Array(16);
  public get generalRegisterValues(): string[] {
    return Array.from(this.registerGeneral).map((value, index) => `V${index.toString(16).toUpperCase()}: 0x${value.toString(16).toUpperCase().padStart(2, "0")}`);
  }

  /** Index register */
  private readonly registerIndex: Uint16Array = new Uint16Array(1);
  public get indexRegisterValue(): string { return `0x${this.registerIndex[0].toString(16).toUpperCase().padStart(4, "0")}`; }

  /** Delay timer register */
  private readonly registerDelay: Uint8Array = new Uint8Array(1);
  public get delayTimerValue(): string { return `0x${this.registerDelay[0].toString(16).toUpperCase().padStart(2, "0")}`; }

  /** Sound timer register */
  private readonly registerSound: Uint8Array = new Uint8Array(1);
  public get soundTimerValue(): string { return `0x${this.registerSound[0].toString(16).toUpperCase().padStart(2, "0")}`; }

  /** Program counter */
  private readonly programCounter: Uint16Array = new Uint16Array(1);
  public get programCounterValue(): string { return `0x${this.programCounter[0].toString(16).toUpperCase().padStart(4, "0")}`; }

  /** Stack pointer */
  private readonly stackPointer: Uint8Array = new Uint8Array(1);
  public get stackPointerValue(): string { return `0x${this.stackPointer[0].toString(16).toUpperCase().padStart(2, "0")}`; }

  /** Execution status */
  private running: boolean = false;
  private loopId: number | undefined = undefined;
  private cycleCount: number = 0;
  private lastCycleTimestamp: number = -1;
  private lastCycleDuration: number = -1;
  public get currentCycleDuration(): number {
    return this.lastCycleDuration;
  }

  public constructor(
    private readonly memory: MemoryImpl,
    private readonly eventBus?: Chip8EventBus,
    private readonly programStartAddress: number = 0x0200,
    private readonly targetExecutionFrequency: number = 200,
    private readonly timerFrequency: number = 60,
  ) { this.clear(); }

  public start(): void {
    if(this.running) return;

    this.running = true;
    this.eventBus?.emit(Chip8Event.PROCESSOR_START);

    const cycleInterval = 1000 / this.targetExecutionFrequency;
    this.loopId = setInterval(() => {
      this.executeCycle();
      this.cycleCount++;
    }, cycleInterval);
  }

  public stop(): void {
    if(!this.running) return;

    clearInterval(this.loopId);
    this.loopId = undefined;
    this.running = false;
    this.eventBus?.emit(Chip8Event.PROCESSOR_STOP);
  }

  public get isRunning(): boolean {
    return this.running;
  }

  public get currentCycle(): number {
    return this.cycleCount;
  }

  public clear(): void {
    this.stop();

    this.registerGeneral.fill(0);
    this.registerIndex.fill(0);
    this.registerDelay.fill(0);
    this.registerSound.fill(0);
    this.programCounter.fill(this.programStartAddress);
    this.stackPointer.fill(0);
    this.cycleCount = 0;

    this.eventBus?.emit(Chip8Event.PROCESSOR_CLEAR);
  }

  private executeCycle(): void {
    this.lastCycleDuration = performance.now() - this.lastCycleTimestamp;
    this.lastCycleTimestamp = performance.now();

    if(this.programCounter[0] === undefined || this.programCounter[0] <= -1) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_INVALID_PC_ADDRESS, this.programCounter[0]);
      this.stop();
      return;
    }

    // Fetch
    const opcode = this.memory.readWordAt(this.programCounter[0]);
    const opcodeBytes: [number, number, number, number] = [     // 0xABCD  (MSB -> LSB)
      (opcode >> 12) & 0xF,   // 0xA
      (opcode >> 8) & 0xF,    // 0xB
      (opcode >> 4) & 0xF,    // 0xC
      opcode & 0xF,           // 0xD
    ];

    // Decode
    // TODO
    if(opcodeBytes[0] === 0x1) {
      this.programCounter[0] = ((opcodeBytes[1] << 8) | (opcodeBytes[2] << 4) | opcodeBytes[3]) & 0xFFF;
      return;
    } else if(opcodeBytes[0] === 0x6) {
      this.registerGeneral[opcodeBytes[1]] = ((opcodeBytes[2] << 4) | opcodeBytes[3]) & 0xFF;
    } else if(opcodeBytes[0] === 0x8) {
      if(opcodeBytes[3] === 0x0) {
        this.registerGeneral[opcodeBytes[1]] = this.registerGeneral[opcodeBytes[2]];
      } else if(opcodeBytes[3] === 0x4) {
        const sum = this.registerGeneral[opcodeBytes[1]] + this.registerGeneral[opcodeBytes[2]];

        this.registerGeneral[0xF] = sum > 0xFF ? 1 : 0;  // carry
        this.registerGeneral[opcodeBytes[1]] = sum & 0xFF;
      }
    }

    // Increment PC (if there's no jump instruction)
    if(this.programCounter[0] !== undefined) {
      this.programCounter[0] += 2;
    }
  }
}
