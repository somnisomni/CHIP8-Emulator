export interface DisplayImpl {
  get displaySize(): [ number, number ];

  setPixel(x: number, y: number, value: number): void;
  dump(): number[][];
  clear(): void;
}

export abstract class DisplayBase implements DisplayImpl {
  protected readonly framebuffer: number[][];

  protected constructor(
    protected readonly size: [ number, number ],
  ) {
    this.framebuffer = Array.from({ length: size[1] }, () => new Array(size[0]).fill(0));
  }

  public get displaySize(): [ number, number ] {
    return this.size;
  }

  public setPixel(x: number, y: number, value: number): void {
    if(x < 0 || x >= this.size[0] || y < 0 || y >= this.size[1] || !this.framebuffer[y]) {
      return;
    }

    this.framebuffer[y][x] = value;
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
  }
}
