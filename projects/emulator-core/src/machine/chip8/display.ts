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
    if(x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1] || !this.framebuffer[y]) {
      this.eventBus?.emit(Chip8Event.DISPLAY_ERROR_OUT_OF_BOUNDS, { x, y });
      return;
    }

    super.setPixel(x, y, value);
    this.eventBus?.emit(Chip8Event.DISPLAY_SET_PIXEL, { x, y, value });
  }

  public override clear(): void {
    super.clear();
    this.eventBus?.emit(Chip8Event.DISPLAY_CLEAR);
  }
}
