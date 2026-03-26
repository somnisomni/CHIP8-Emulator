import type { DisplayImpl } from "../../base/display";
import type { MemoryImpl } from "../../base/memory";
import type { Chip8ProcessorRegisters } from "./registers";

export type Chip8OpcodeBytes = [number, number, number, number];
export type Chip8OpcodeData = { description: string, pattern: number, mask: number, handle: (rawInstruction: number, registers: Chip8ProcessorRegisters, memory: MemoryImpl, display: DisplayImpl) => boolean /* true => increment PC after execution, otherwise false */ };

export class Chip8Opcode {
  private static readonly opcodeMap: Chip8OpcodeData[] = [
    /* 0x0nnn */
    { description: "NOOP", pattern: 0x0000, mask: 0xFFFF, handle() { return true; } },
    { description: "CLS", pattern: 0x00E0, mask: 0xFFFF, handle(_1, _2, _3, display) {
      display.clear();
      return true;
    } },
    { description: "RET", pattern: 0x00EE, mask: 0xFFFF, handle(_, registers) {
      registers.popStack();
      return false;
    } },

    /* 0x1nnn */
    { description: "JP 0x{1}{2}{3}", pattern: 0x1000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const addr = unpack[1] + unpack[2] + unpack[3];
      registers.programCounter = addr;
      return false;
    } },

    /* 0x2nnn */
    { description: "CALL 0x{1}{2}{3}", pattern: 0x2000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const addr = unpack[1] + unpack[2] + unpack[3];
      registers.pushStack(addr);
      return false;
    } },

    /* 0x3nnn */
    { description: "SE V{1}, 0x{2}{3}", pattern: 0x3000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      if(registers.getGeneral(unpackNibbles[1]) == (unpack[2] + unpack[3])) {
        registers.programCounter += 2;
      }
      return true;
    } },

    /* 0x4nnn */
    { description: "SNE V{1}, 0x{2}{3}", pattern: 0x4000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      if(registers.getGeneral(unpackNibbles[1]) !== (unpack[2] + unpack[3])) {
        registers.programCounter += 2;
      }
      return true;
    } },

    /* 0x5nnn */
    { description: "SE V{1}, V{2}", pattern: 0x5000, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      if(registers.getGeneral(unpackNibbles[1]) === registers.getGeneral(unpackNibbles[2])) {
        registers.programCounter += 2;
      }
      return true;
    } },

    /* 0x6nnn */
    { description: "LD V{1}, 0x{2}{3}", pattern: 0x6000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], unpack[2] + unpack[3]);
      return true;
    } },

    /* 0x7nnn */
    { description: "ADD V{1}, 0x{2}{3}", pattern: 0x7000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.getGeneral(unpackNibbles[1]) + (unpack[2] + unpack[3]));
      return true;
    } },

    /* 0x8nnn */
    { description: "LD V{1}, V{2}", pattern: 0x8000, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.getGeneral(unpackNibbles[2]));
      return true;
    } },
    { description: "OR V{1}, V{2}", pattern: 0x8001, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.getGeneral(unpackNibbles[1]) | registers.getGeneral(unpackNibbles[2]));
      return true;
    } },
    { description: "AND V{1}, V{2}", pattern: 0x8002, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.getGeneral(unpackNibbles[1]) & registers.getGeneral(unpackNibbles[2]));
      return true;
    } },
    { description: "XOR V{1}, V{2}", pattern: 0x8003, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.getGeneral(unpackNibbles[1]) ^ registers.getGeneral(unpackNibbles[2]));
      return true;
    } },
    { description: "ADD V{1}, V{2}", pattern: 0x8004, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      const sum = registers.getGeneral(unpackNibbles[1]) + registers.getGeneral(unpackNibbles[2]);
      registers.setGeneral(0xF, sum > 0xFF ? 1 : 0);      // carry
      registers.setGeneral(unpackNibbles[1], sum & 0xFF); // sum
      return true;
    } },
    { description: "SUB V{1}, V{2}", pattern: 0x8005, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      const sub = registers.getGeneral(unpackNibbles[1]) - registers.getGeneral(unpackNibbles[2]);
      registers.setGeneral(0xF, sub >= 0 ? 1 : 0);        // not borrow
      registers.setGeneral(unpackNibbles[1], sub & 0xFF); // sub
      return true;
    } },
    { description: "SHR V{1}", pattern: 0x8006, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      const value = registers.getGeneral(unpackNibbles[1]);
      registers.setGeneral(0xF, (value & 0b1) === 0b1 ? 1 : 0);
      registers.setGeneral(unpackNibbles[1], value / 2);
      return true;
    } },
    { description: "SUBN V{1}, V{2}", pattern: 0x8007, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      const sub = registers.getGeneral(unpackNibbles[2]) - registers.getGeneral(unpackNibbles[1]);
      registers.setGeneral(0xF, sub >= 0 ? 1 : 0);        // not borrow
      registers.setGeneral(unpackNibbles[1], sub & 0xFF); // sub
      return true;
    } },

    /* 0x9nnn */
    { description: "SNE V{1}, V{2}", pattern: 0x9000, mask: 0xF00F, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      if(registers.getGeneral(unpackNibbles[1]) !== registers.getGeneral(unpackNibbles[2])) {
        registers.programCounter += 2;
      }
      return true;
    } },

    /* 0xAnnn */
    { description: "LD I, 0x{1}{2}{3}", pattern: 0xA000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      registers.index = unpack[1] + unpack[2] + unpack[3];
      return true;
    } },

    /* 0xBnnn */
    { description: "JP V0, 0x{1}{2}{3}", pattern: 0xB000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      registers.programCounter = (unpack[1] + unpack[2] + unpack[3]) + registers.getGeneral(0x0);
      return false;
    } },

    /* 0xCnnn */
    { description: "RND V{1}, 0x{2}{3}", pattern: 0xC000, mask: 0xF000, handle(rawInstruction, registers) {
      const unpack = Chip8Opcode.positionalUnpack(rawInstruction);
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], Math.round(Math.random() * 0xFF) & (unpack[2] + unpack[3]));
      return true;
    } },

    /* 0xDnnn */
    // { description: "DRW V{1}, V{2}, 0x{3}", pattern: 0xD000, mask: 0xF000, handle(rawInstruction, registers, memory, display) {

    //   return true;
    // } },

    /* 0xEnnn */
    // TODO: Ex9E
    // TODO: ExA1

    /* 0xFnnn */
    { description: "LD V{1}, DT", pattern: 0xF007, mask: 0xF0FF, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.setGeneral(unpackNibbles[1], registers.delayTimer);
      return true;
    } },
    // TODO: Fx0A
    { description: "LD DT, V{1}", pattern: 0xF015, mask: 0xF0FF, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.delayTimer = registers.getGeneral(unpackNibbles[1]);
      return true;
    } },
    { description: "LD ST, V{1}", pattern: 0xF018, mask: 0xF0FF, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.soundTimer = registers.getGeneral(unpackNibbles[1]);
      return true;
    } },
    { description: "ADD I, V{1}", pattern: 0xF01E, mask: 0xF0FF, handle(rawInstruction, registers) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      registers.index += registers.getGeneral(unpackNibbles[1]);
      return true;
    } },
    // TODO: Fx29
    { description: "LD B, V{1}", pattern: 0xF033, mask: 0xF0FF, handle(rawInstruction, registers, memory) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      const value = registers.getGeneral(unpackNibbles[1]);
      memory.writeAt(registers.index,     Math.floor(value / 100));         // hundreds digit at I
      memory.writeAt(registers.index + 1, Math.floor((value % 100) / 10));  // tens digit at I + 1
      memory.writeAt(registers.index + 2, Math.floor((value % 10)  / 1));   // ones digit at I + 2
      return true;
    } },
    { description: "LD [I], V{1}", pattern: 0xF055, mask: 0xF0FF, handle(rawInstruction, registers, memory) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      for(let index = 0; index <= unpackNibbles[1]; index++) {
        const value = registers.getGeneral(index);
        memory.writeAt(registers.index + index, value);
      }
      return true;
    } },
    { description: "LD V{1}, [I]", pattern: 0xF065, mask: 0xF0FF, handle(rawInstruction, registers, memory) {
      const unpackNibbles = Chip8Opcode.unpack(rawInstruction);
      for(let index = 0; index <= unpackNibbles[1]; index++) {
        const value = memory.readAt(registers.index + index);
        if(value === null) continue;
        registers.setGeneral(index, value);
      }
      return true;
    } },
  ];

  public static parseOpcode(instruction: number): Chip8OpcodeData | null {
    const opcode = this.opcodeMap.find(item => (instruction & item.mask) === item.pattern);

    if(!opcode) return null;

    return opcode;
  }

  private static unpack(instruction: number): Chip8OpcodeBytes {
    // Unpack word number into nibbles, useful in control flow

    return [                     // 0xABCD  (MSB -> LSB)
      (instruction >> 12) & 0xF, // 0xA
      (instruction >> 8)  & 0xF, // 0xB
      (instruction >> 4)  & 0xF, // 0xC
      instruction         & 0xF, // 0xD
    ];
  }

  private static positionalUnpack(instruction: number): Chip8OpcodeBytes {
    // Unpack word number into positional segments, useful in math

    return [                // 0xABCD  (MSB -> LSB)
      instruction & 0xF000, // 0xA000
      instruction & 0xF00,  // 0x0B00
      instruction & 0xF0,   // 0x00C0
      instruction & 0xF,    // 0x000D
    ];
  }
}
