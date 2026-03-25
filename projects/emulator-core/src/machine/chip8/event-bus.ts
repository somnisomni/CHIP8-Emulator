import EventBusBase, { type EventBusLogHandler } from "../base/event-bus";

export enum Chip8Event {
  /* PANIC - must stop the emulation immediately */
  PANIC = 0xFFFF_FFFF,

  /* Keyboard Events */
  KEY_DOWN       = 0x1000_0000,
  KEY_UP         = 0x1000_0001,
  KEY_STATE_READ = 0x1000_0002,

  /* Keyboard Errors */
  // No error events for keyboard as of now

  /* Memory Events */
  MEMORY_READ              = 0x2000_0000,
  MEMORY_WRITE             = 0x2000_0001,
  MEMORY_CLEAR             = 0x2000_0002,
  MEMORY_WRITE_RANGE_START = 0x2000_0003,
  MEMORY_WRITE_RANGE_END   = 0x2000_0004,

  /* Memory Errors */
  MEMORY_ERROR_UNKNOWN             = 0x2000_F000,
  MEMORY_ERROR_OUT_OF_BOUNDS       = 0x2000_F001,
  MEMORY_ERROR_PROHIBITED          = 0x2000_F002,
  MEMORY_ERROR_WRITE_INVALID_VALUE = 0x2000_F003,

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
  DISPLAY_ERROR_OUT_OF_BOUNDS = 0x4000_F000,
}

export class Chip8EventBus extends EventBusBase<Chip8Event> {
  public constructor(logger?: null | EventBusLogHandler) {
    super(logger, (event) => Chip8Event[event]);
  }
}
