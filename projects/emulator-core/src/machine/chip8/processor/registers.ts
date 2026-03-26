import type { EventBusImpl } from "../../base/event-bus";
import { Chip8Event, type Chip8EventDetailTypeMap } from "../event-bus";

export class Chip8ProcessorRegisters {
  public constructor(
    private readonly eventBus?: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>,
    private readonly maxSubroutineDepth: number = 16,
  ) { this._stack = new Uint16Array(maxSubroutineDepth); }

  /* General purpose registers (V0 ~ VF) */
  private readonly _general: Uint8Array = new Uint8Array(16);

  public setGeneral(index: number, value: number): void {
    value = Math.floor(value);

    if(index < 0 || index >= this._general.length) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_INVALID_REGISTER_INDEX, { registerIndex: `V${index.toString(16).toUpperCase()}` });
      return;
    }

    if(value !== (value & 0xFF)) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: `V${index.toString(16).toUpperCase()}`, attemptedValue: value });
    }

    this._general[index] = value & 0xFF;
  }

  public getGeneral(index: number): number {
    if(index < 0 || index >= this._general.length) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_INVALID_REGISTER_INDEX, { registerIndex: `V${index.toString(16).toUpperCase()}` });
      return 0;
    }

    if(this._general[index] === undefined || this._general[index] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: `at general register V${index.toString(16).toUpperCase()}` });
      return 0;
    }

    return this._general[index];
  }

  public dumpGeneral(): number[] {
    return Array.from(this._general);
  }

  /* Index register */
  private readonly _index: Uint16Array = new Uint16Array(1);

  public set index(value: number) {
    value = Math.floor(value);

    if(value !== (value & 0x0FFF)) {  // Only 12 bits (0 ~ 4095) are used for I
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: "I", attemptedValue: value });
    }

    this._index[0] = value & 0x0FFF;
  }

  public get index(): number {
    if(this._index[0] === undefined || this._index[0] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: "at index register" });
      return 0;
    }

    return this._index[0];
  }

  /* Delay timer register */
  private readonly _delayTimer: Uint8Array = new Uint8Array(1);

  public set delayTimer(value: number) {
    value = Math.floor(value);

    if(value !== (value & 0xFF)) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: "DT", attemptedValue: value });
    }

    this._delayTimer[0] = value & 0xFF;
  }

  public get delayTimer(): number {
    if(this._delayTimer[0] === undefined || this._delayTimer[0] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: "at delay timer register" });
      return 0;
    }

    return this._delayTimer[0];
  }

  /* Sound timer register */
  private readonly _soundTimer: Uint8Array = new Uint8Array(1);

  public set soundTimer(value: number) {
    value = Math.floor(value);

    if(value !== (value & 0xFF)) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: "ST", attemptedValue: value });
    }

    this._soundTimer[0] = value & 0xFF;
  }

  public get soundTimer(): number {
    if(this._soundTimer[0] === undefined || this._soundTimer[0] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: "at sound timer register" });
      return 0;
    }

    return this._soundTimer[0];
  }

  /* Program counter */
  private readonly _programCounter: Uint16Array = new Uint16Array(1);

  public set programCounter(value: number) {
    value = Math.floor(value);

    if(value !== (value & 0xFFFF)) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: "PC", attemptedValue: value });
    }

    this._programCounter[0] = value & 0xFFFF;
  }

  public get programCounter(): number {
    if(this._programCounter[0] === undefined || this._programCounter[0] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: "at program counter register" });
      return 0;
    }

    return this._programCounter[0];
  }

  /* Stack */
  private readonly _stackPointer: Uint8Array = new Uint8Array(1);
  private readonly _stack: Uint16Array;

  private set stackPointer(value: number) {
    value = Math.floor(value);

    if(value !== (value & 0xFF)) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED, { registerIndex: "SP", attemptedValue: value });
    }

    this._stackPointer[0] = value & 0xFF;
  }

  public get stackPointer(): number {
    if(this._stackPointer[0] === undefined || this._stackPointer[0] === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: "at stack pointer register" });
      return 0;
    }

    return this._stackPointer[0];
  }

  public pushStack(address: number): void {
    if(this.stackPointer >= this.maxSubroutineDepth - 1) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_SUBROUTINE_STACK_OVERFLOW);
      this.eventBus?.emit(Chip8Event.PANIC);
      return;
    }

    this._stack[this.stackPointer] = this.programCounter + 2;  // Next PC offset to be used when popped
    this.stackPointer++;
    this.programCounter = address;
  }

  public popStack(): void {
    if(this.stackPointer <= 0) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_SUBROUTINE_STACK_OVERFLOW);
      this.eventBus?.emit(Chip8Event.PANIC);
      return;
    }

    const value = this._stack[this.stackPointer - 1];

    if(value === undefined || value === null) {
      this.eventBus?.emit(Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION, { message: `stack value at ${this.stackPointer}` });
      return;
    }

    this.stackPointer--;
    this.programCounter = value;
  }

  /* General functions */
  public dumpAll(): {
    V: number[];
    I: number;
    DT: number;
    ST: number;
    PC: number;
    SP: number;
    stack: number[];
  } {
    return {
      V: this.dumpGeneral(),
      I: this.index,
      DT: this.delayTimer,
      ST: this.soundTimer,
      PC: this.programCounter,
      SP: this.stackPointer,
      stack: Array.from(this._stack),
    };
  }

  public clearAll(programCounterStartAddress: number = 0x0200): void {
    this._general.fill(0);
    this._index[0] = 0;
    this._delayTimer[0] = 0;
    this._soundTimer[0] = 0;
    this._programCounter[0] = programCounterStartAddress;
    this._stackPointer[0] = 0;
    this._stack.fill(0);
  }
}
