import { DisplayBase } from "../base/display";
import type { EventBusImpl } from "../base/event-bus";
import { Chip8Event, type Chip8EventDetailTypeMap } from "./event-bus";

export class Chip8Display extends DisplayBase {
  public constructor(
    private readonly eventBus?: EventBusImpl<Chip8Event, Chip8EventDetailTypeMap>,
    size: [ number, number ] = [ 64, 32 ],
  ) {
    super(size);
  }

  public override setPixel(x: number, y: number, value: number): void {
    super.setPixel(x, y, value);
    this.eventBus?.emit(Chip8Event.DISPLAY_SET_PIXEL, { x, y, value });
  }

  public override getPixel(x: number, y: number): number | null {
    const value = super.getPixel(x, y);

    if(value === null || value < 0) {
      this.eventBus?.emit(Chip8Event.DISPLAY_ERROR_EMULATOR_IMPLEMENTATION);
    }

    return value;
  }

  public override clear(): void {
    super.clear();
    this.eventBus?.emit(Chip8Event.DISPLAY_CLEAR);
  }
}
