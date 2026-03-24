import { Chip8Memory } from "../memory";

test("CHIP-8 Memory", () => {
  it("should initialize with 4096 bytes if not specified", () => {
    const memory = new Chip8Memory();
    expect(memory.size).toBe(4096);
  });
});
