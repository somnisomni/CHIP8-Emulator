export interface MemoryImpl {
  get totalBytesRead(): number;
  get totalBytesWritten(): number;

  readAt(address: number): number | null;
  readWordAt(address: number): number | null;
  writeAt(address: number, value: number): void;
  writeRange(startAddress: number, values: Uint8Array): void;
  clear(): void;
}

export abstract class MemoryBase implements MemoryImpl {
  protected readonly memory: Uint8Array;

  protected _totalBytesRead: number = 0;
  public get totalBytesRead(): number { return this._totalBytesRead; }

  protected _totalBytesWritten: number = 0;
  public get totalBytesWritten(): number { return this._totalBytesWritten; }

  protected constructor(
    public readonly size: number,
  ) {
    this.memory = new Uint8Array(size);
    this.clear();
  }

  public readAt(address: number): number | null {
    const value = this.memory[address];
    this._totalBytesRead++;

    if(value === undefined || value === null) {
      return null;
    }

    return value;
  }

  public readWordAt(address: number): number | null {
    const highByte = this.readAt(address);
    const lowByte = this.readAt(address + 1);

    if(highByte === null || lowByte === null) {
      return null;
    }

    return (highByte << 8) | lowByte;
  }

  public writeAt(address: number, value: number): void {
    this.memory[address] = value;
    this._totalBytesWritten++;
  }

  public writeRange(startAddress: number, values: Uint8Array): void {
    for(let offset = 0; offset < values.length; offset++) {
      const addr = startAddress + offset;
      const value = values[offset];

      this.writeAt(addr, value ?? -1);
    }
  }

  public clear(): void {
    this.memory.fill(0);
    this._totalBytesRead = 0;
    this._totalBytesWritten = 0;
  }
}
