<main>
  {@render children()}
</main>

<script lang="ts">
import type { Snippet } from "svelte";
import "$/styles/tailwind.css";

const { children }: { children: Snippet } = $props();
</script>
