export interface DisplayImpl {
  get displaySize(): [ number, number ];

  setPixel(x: number, y: number, value: number): void;
  getPixel(x: number, y: number): number | null;
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
    const normalized = this.getNormalizedCoord(x, y);

    this.framebuffer[normalized[1]]![normalized[0]] = value;
  }

  public getPixel(x: number, y: number): number | null {
    const normalized = this.getNormalizedCoord(x, y);

    return this.framebuffer[normalized[1]]![normalized[0]] ?? null;
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

  protected getNormalizedCoord(x: number, y: number): [ number, number ] {
    return [
      x % this.size[0],
      y % this.size[1],
    ];
  }
}
