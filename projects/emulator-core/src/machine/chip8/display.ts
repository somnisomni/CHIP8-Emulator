import type { EventBusImpl } from "../base/event-bus";
import { Chip8Event } from "./event-bus";

export class Chip8Display {
  private readonly framebuffer: number[][];

  public get displaySize(): [ number, number ] {
    return this.size;
  }

  public constructor(
    private readonly eventBus?: EventBusImpl<Chip8Event>,
    private readonly size: [ number, number ] = [ 64, 32 ],
  ) {
    this.framebuffer = Array.from({ length: size[1] }, () => new Array(size[0]).fill(0));
  }

  public setPixel(x: number, y: number, value: number): void {
    if(x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1] || !this.framebuffer[y]) {
      this.eventBus?.emit(Chip8Event.DISPLAY_ERROR_OUT_OF_BOUNDS, { x, y });
      return;
    }

    this.framebuffer[y][x] = value;
    this.eventBus?.emit(Chip8Event.DISPLAY_SET_PIXEL, { x, y, value });
  }

  public dump(): number[][] {
    return this.framebuffer.map(row => row.slice());
  }

  public clear(): void {
    for(let y = 0; y < this.size[1]; y++) {
      for(let x = 0; x < this.size[0]; x++) {
        this.framebuffer[y]![x] = 0;
      }
    }

    this.eventBus?.emit(Chip8Event.DISPLAY_CLEAR);
  }
}
