import { Chip8Memory } from "../memory";

describe("CHIP-8 Memory", () => {
  describe("Initialization", () => {
    it("should initialize with 4096 bytes if not specified", () => {
      const memory = new Chip8Memory();
      expect(memory.size).toBe(4096);
    });
  });

  describe("Reading", () => {
    it("should not allow reading from prohibited addresses", () => {
      const memory = new Chip8Memory();

      // Within prohibited space
      expect(memory.readAt(0x0000)).toBeNull();
      expect(memory.readAt(0x01FF)).toBeNull();
      expect(memory.readAt(0x0000, true)).toBe(0);
      expect(memory.readAt(0x01FF, true)).toBe(0);
    });

    it("should not allow reading words from prohibited addresses", () => {
      const memory = new Chip8Memory();

      expect(memory.readWordAt(0x0000)).toBeNull();
      expect(memory.readWordAt(0x01FF)).toBeNull();
    });
  });

  describe("Writing", () => {
    it("should not allow writing to prohibited addresses", () => {
      const memory = new Chip8Memory();

      memory.writeAt(0x0000, 0xAA);
      expect(memory.readAt(0x0000)).toBeNull();
      memory.writeAt(0x01FF, 0xAA);
      expect(memory.readAt(0x01FF)).toBeNull();

      // Should not be written to prohibited space without flag
      for(let addr = 0x0000; addr <= 0x01FF; addr++) {
        memory.writeAt(addr, addr % 0xFF);
        expect(memory.readAt(addr)).toBeNull();
        expect(memory.readAt(addr, true)).toBe(0);
      }

      // Should be written to prohibited space with flag
      for(let addr = 0x0000; addr <= 0x01FF; addr++) {
        memory.writeAt(addr, addr % 0xFF, true);
        expect(memory.readAt(addr)).toBeNull();
        expect(memory.readAt(addr, true)).toBe(addr % 0xFF);
      }
    });
  });
});
