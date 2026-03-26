import { MemoryBase } from "../memory";

class MockMemory extends MemoryBase {
  public constructor(size: number = 1024) {
    super(size);
  }
}

describe("Memory Base Implementation", () => {
  describe("Initialization", () => {
    it("should be zero for read/write counts right after initialization", () => {
      const memory = new MockMemory();
      expect(memory.totalBytesRead).toBe(0);
      expect(memory.totalBytesWritten).toBe(0);
    });
  });

  describe("Reading", () => {
    it("should be able to read values (right after initialization) within the memory size", () => {
      const memory = new MockMemory();

      expect(memory.readAt(0x0000)).toBe(0);
      expect(memory.readAt(0x00AA)).toBe(0);
      expect(memory.readAt(memory.size - 1)).toBe(0);
    });

    it("should not allow reading from invalid addresses", () => {
      const memory = new MockMemory(1024);

      // Overflow addresses
      expect(memory.readAt(-1)).toBeNull();
      expect(memory.readAt(memory.size)).toBeNull();

      // Non-integer addresses
      expect(memory.readAt(Infinity)).toBeNull();
      expect(memory.readAt(-Infinity)).toBeNull();
      expect(memory.readAt(NaN)).toBeNull();

      // Ridiculously large addresses
      expect(memory.readAt(0xABCDEFABCDEF)).toBeNull();
    });

    it("should be able to read words (right after initialization) within the memory size", () => {
      const memory = new MockMemory();

      expect(memory.readWordAt(0x0000)).toBe(0);
      expect(memory.readWordAt(0x00AA)).toBe(0);
      expect(memory.readWordAt(memory.size - 2)).toBe(0);
    });

    it("should not allow reading words from invalid addresses", () => {
      const memory = new MockMemory(1024);

      // Overflow addresses
      expect(memory.readWordAt(-1)).toBeNull();
      expect(memory.readWordAt(memory.size)).toBeNull();
      expect(memory.readWordAt(memory.size - 1)).toBeNull();  // Second byte is out of bounds

      // Non-integer addresses
      expect(memory.readWordAt(Infinity)).toBeNull();
      expect(memory.readWordAt(-Infinity)).toBeNull();
      expect(memory.readWordAt(NaN)).toBeNull();

      // Ridiculously large addresses
      expect(memory.readWordAt(0xABCDEFABCDEF)).toBeNull();
    });
  });

  describe("Writing", () => {
    it("should be able to write values within the memory size", () => {
      const memory = new MockMemory(1024);

      for(let addr = 0x0000; addr < memory.size; addr++) {
        memory.writeAt(addr, addr % 0xFF);
        expect(memory.readAt(addr)).toBe(addr % 0xFF);
      }
    });

    it("should not allow writing to invalid addresses", () => {
      const memory = new MockMemory(1024);

      // Overflow addresses
      memory.writeAt(-1, 0xAA);
      expect(memory.readAt(-1)).toBeNull();
      memory.writeAt(memory.size, 0xAA);
      expect(memory.readAt(memory.size)).toBeNull();

      // Non-integer addresses
      memory.writeAt(Infinity, 0xAA);
      expect(memory.readAt(Infinity)).toBeNull();
      memory.writeAt(-Infinity, 0xAA);
      expect(memory.readAt(-Infinity)).toBeNull();
      memory.writeAt(NaN, 0xAA);
      expect(memory.readAt(NaN)).toBeNull();

      // Ridiculously large addresses
      memory.writeAt(0xABCDEFABCDEF, 0xAA);
      expect(memory.readAt(0xABCDEFABCDEF)).toBeNull();
    });

    it("should be able to write ranged values within the memory size", () => {
      const memory = new MockMemory(1024);

      const values = new Uint8Array([ 0xC0, 0xFF, 0xEE, 0xBE, 0xEF ]);
      memory.writeRange(0x00AA, values);

      for(let offset = 0; offset < values.length; offset++) {
        const addr = 0x00AA + offset;
        expect(memory.readAt(addr)).toBe(values[offset]);
      }
    });
  });
});
