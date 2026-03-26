import type { EventBusImpl } from "../base/event-bus";
import KeyboardBase from "../base/keyboard";
import { Chip8Event, type Chip8EventDetailTypeMap } from "./event-bus";

export enum Chip8Key {
  KEY_0 = 0x0,
  KEY_1 = 0x1,
  KEY_2 = 0x2,
  KEY_3 = 0x3,
  KEY_4 = 0x4,
  KEY_5 = 0x5,
  KEY_6 = 0x6,
  KEY_7 = 0x7,
  KEY_8 = 0x8,
  KEY_9 = 0x9,
  KEY_A = 0xA,
  KEY_B = 0xB,
  KEY_C = 0xC,
  KEY_D = 0xD,
  KEY_E = 0xE,
  KEY_F = 0xF,
}

export class Chip8Keyboard extends KeyboardBase<Chip8Key> {
  public constructor(
    private readonly eventBus?: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>,
  ) {
    super(Object.values(Chip8Key).filter(value => typeof value === "number"));
  }

  public override press(key: Chip8Key): void {
    super.press(key);
    this.eventBus?.emit(Chip8Event.KEY_DOWN, key);
  }

  public override release(key: Chip8Key): void {
    super.release(key);
    this.eventBus?.emit(Chip8Event.KEY_UP, key);
  }

  public override isPressed(key: Chip8Key): boolean {
    const isPressed = super.isPressed(key);
    this.eventBus?.emit(Chip8Event.KEY_STATE_READ, key);
    return isPressed;
  }

  public override clear(): void {
    super.clear();
    this.eventBus?.emit(Chip8Event.KEYBOARD_CLEAR);
  }
}
