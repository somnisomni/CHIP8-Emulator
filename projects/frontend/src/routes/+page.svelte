<p>Program counter: { pc }</p>
<p>Cycle: { cycle }</p>
<p>Real execution time per cycle: { cycleTime } ms</p>
<br />
<p>General registers:</p>
{#each v as register, index (index)}
  <p>{ register }</p>
{/each}

<script lang="ts">
import { Chip8Machine } from "@somni/chip8-emulator-core";
import { onMount } from "svelte";

const testRom = new Uint8Array([
  0x60, 0x0A, // 0x200: LD V0, 10      - Set V0 to 10 (0x0A)
  0x61, 0x14, // 0x202: LD V1, 20      - Set V1 to 20 (0x14)
  0x62, 0x01, // 0x204: LD V2, 1       - Set V2 to 1 (0x01)
  0x80, 0x14, // 0x204: ADD V0, V1     - Add V1 to V0. V0 = 30 (0x1E). VF = 0 (no carry).
  0x81, 0x24,
  0x12, 0x04, // 0x206: JP 0x204       - Jump to address 0x204
]);

const testRom2 = new Uint8Array([
  0x60, 0x01, // 0x200: LD V0, 1   - Initialize V0 to 1
  0x61, 0x00, // 0x202: LD V1, 0   - Initialize V1 to 0
  0x62, 0x00, // 0x204: LD V2, 0   - Initialize V2 to 0
  0x63, 0x00, // 0x206: LD V3, 0   - Initialize V3 to 0
  0x64, 0x00, // 0x208: LD V4, 0   - Initialize V4 to 0
  0x65, 0x00, // 0x20A: LD V5, 0   - Initialize V5 to 0

  // Loop Start at 0x20C
  0x70, 0x01, // 0x20C: ADD V0, 1  - Increment V0 by 1
  0x81, 0x04, // 0x20E: ADD V1, V0 - V1 = V1 + V0 (Sets VF to 1 if overflow)
  0x82, 0x14, // 0x210: ADD V2, V1 - V2 = V2 + V1 (Sets VF to 1 if overflow)
  0x83, 0x24, // 0x212: ADD V3, V2 - V3 = V3 + V2 (Sets VF to 1 if overflow)
  0x84, 0x34, // 0x214: ADD V4, V3 - V4 = V4 + V3 (Sets VF to 1 if overflow)
  0x85, 0x44, // 0x216: ADD V5, V4 - V5 = V5 + V4 (Sets VF to 1 if overflow)

  0x12, 0x0C,  // 0x218: JP 0x20C   - Jump back to 0x20C (Infinite loop)
]);

const machine = $state(new Chip8Machine({ eventBusLogger: console.log }));
machine.loadProgram(testRom2);
machine.processor.start();

let pc: string = $state("");
let v: string[] = $state([]);
let cycle: string = $state("");
let cycleTime: string = $state("");

onMount(() => {
  const interval = setInterval(() => {
    pc = machine.processor.programCounterValue;
    v = machine.processor.generalRegisterValues;
    cycle = machine.processor.currentCycle.toString();
    cycleTime = machine.processor.currentCycleDuration.toFixed(2);
  }, 1000 / 60);
});
</script>
