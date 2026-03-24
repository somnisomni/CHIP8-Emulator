export interface MemoryImpl {
  readAt(address: number): number;
  readWordAt(address: number): number;
  writeAt(address: number, value: number): void;
  writeRange(startAddress: number, values: Uint8Array): void;
  clear(): void;
}

export abstract class MemoryBase implements MemoryImpl {
  protected readonly memory: Uint8Array;

  protected constructor(
    public readonly size: number,
  ) {
    this.memory = new Uint8Array(size);
    this.clear();
  }

  public readAt(address: number): number {
    const value = this.memory[address];

    if(value === undefined || value === null) {
      return -1;
    }

    return value;
  }

  public readWordAt(address: number): number {
    const highByte = this.readAt(address);
    const lowByte = this.readAt(address + 1);

    return (highByte << 8) | lowByte;
  }

  public writeAt(address: number, value: number): void {
    this.memory[address] = value;
  }

  public writeRange(startAddress: number, values: Uint8Array): void {
    this.memory.set(values, startAddress);
  }

  public clear(): void {
    this.memory.fill(0);
  }
}
