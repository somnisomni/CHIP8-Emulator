import EventBusBase, { type EventBusLogHandler } from "../base/event-bus";
import type { Chip8Key } from "./keyboard";

export enum Chip8Event {
  /* PANIC - must stop the emulation immediately */
  PANIC = 0xFFFF_FFFF,

  /* Keyboard Events */
  KEY_DOWN       = 0x1000_0000,
  KEY_UP         = 0x1000_0001,
  KEY_STATE_READ = 0x1000_0002,
  KEYBOARD_CLEAR = 0x1000_0003,

  /* Keyboard Errors */
  // No error events for keyboard as of now

  /* Memory Events */
  MEMORY_READ              = 0x2000_0000,
  MEMORY_WRITE             = 0x2000_0001,
  MEMORY_CLEAR             = 0x2000_0002,
  MEMORY_WRITE_RANGE_START = 0x2000_0003,
  MEMORY_WRITE_RANGE_END   = 0x2000_0004,

  /* Memory Errors */
  MEMORY_ERROR_OUT_OF_BOUNDS       = 0x2000_F000,
  MEMORY_ERROR_PROHIBITED          = 0x2000_F001,
  MEMORY_ERROR_WRITE_INVALID_VALUE = 0x2000_F002,

  /* Processor Events */
  PROCESSOR_CLEAR = 0x3000_0000,
  PROCESSOR_START = 0x3000_0001,
  PROCESSOR_STOP  = 0x3000_0002,

  /* Processor Warnings */
  PROCESSOR_WARN_REGISTER_VALUE_CLIPPED = 0x3000_E000,
  PROCESSOR_WARN_UNKNOWN_OPCODE         = 0x3000_E001,

  /* Processor Errors */
  PROCESSOR_ERROR_INVALID_PC_ADDRESS        = 0x3000_F000,
  PROCESSOR_ERROR_INVALID_REGISTER_INDEX    = 0x3000_F001,
  PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION   = 0x3000_F002,
  PROCESSOR_ERROR_SUBROUTINE_STACK_OVERFLOW = 0x3000_F003,

  /* Display Events */
  DISPLAY_SET_PIXEL = 0x4000_0000,
  DISPLAY_CLEAR     = 0x4000_0001,

  /* Display Errors */
  DISPLAY_ERROR_EMULATOR_IMPLEMENTATION = 0x4000_F000,
}

export type Chip8EventDetailTypeMap = {
  /* PANIC */
  [Chip8Event.PANIC]: never,

  /* Keyboard Events */
  [Chip8Event.KEY_DOWN]: Chip8Key,
  [Chip8Event.KEY_UP]: Chip8Key,
  [Chip8Event.KEY_STATE_READ]: Chip8Key,
  [Chip8Event.KEYBOARD_CLEAR]: never,

  /* Keyboard Errors */

  /* Memory Events */
  [Chip8Event.MEMORY_READ]: { address: number, value: number };
  [Chip8Event.MEMORY_WRITE]: { address: number, value: number };
  [Chip8Event.MEMORY_CLEAR]: never;
  [Chip8Event.MEMORY_WRITE_RANGE_START]: { startAddress: number, length: number };
  [Chip8Event.MEMORY_WRITE_RANGE_END]: { startAddress: number, length: number };

  /* Memory Errors */
  [Chip8Event.MEMORY_ERROR_OUT_OF_BOUNDS]: { address: number };
  [Chip8Event.MEMORY_ERROR_PROHIBITED]: { address: number };
  [Chip8Event.MEMORY_ERROR_WRITE_INVALID_VALUE]: { address: number, attemptedValue: number };

  /* Processor Events */
  [Chip8Event.PROCESSOR_CLEAR]: never;
  [Chip8Event.PROCESSOR_START]: never;
  [Chip8Event.PROCESSOR_STOP]: never;

  /* Processor Warnings */
  [Chip8Event.PROCESSOR_WARN_REGISTER_VALUE_CLIPPED]: { registerIndex: string, attemptedValue: number };
  [Chip8Event.PROCESSOR_WARN_UNKNOWN_OPCODE]: { opcode: number };

  /* Processor Errors */
  [Chip8Event.PROCESSOR_ERROR_INVALID_PC_ADDRESS]: { address: number };
  [Chip8Event.PROCESSOR_ERROR_INVALID_REGISTER_INDEX]: { registerIndex: string };
  [Chip8Event.PROCESSOR_ERROR_EMULATOR_IMPLEMENTATION]: { message: string } | never;
  [Chip8Event.PROCESSOR_ERROR_SUBROUTINE_STACK_OVERFLOW]: never;

  /* Display Events */
  [Chip8Event.DISPLAY_SET_PIXEL]: { x: number, y: number, value: number };
  [Chip8Event.DISPLAY_CLEAR]: never;

  /* Display Errors */
  [Chip8Event.DISPLAY_ERROR_EMULATOR_IMPLEMENTATION]: { message: string } | never;
};

export class Chip8EventBus extends EventBusBase<Chip8Event, Chip8EventDetailTypeMap> {
  public constructor(logger?: null | EventBusLogHandler) {
    super(logger, (event) => Chip8Event[event]);
  }
}
