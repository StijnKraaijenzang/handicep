<script setup lang="ts">
const props = defineProps<{
  value: number
}>()

const dotPositions: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

const dots = computed(() => dotPositions[props.value] ?? [])
</script>

<template>
  <svg
    class="dice-face"
    viewBox="0 0 100 100"
    role="img"
    :aria-label="`Dobbelsteen toont ${value}`"
  >
    <rect x="4" y="4" width="92" height="92" rx="16" class="dice-face__bg" />
    <circle
      v-for="(pos, i) in dots"
      :key="i"
      :cx="pos[0]"
      :cy="pos[1]"
      r="9"
      class="dice-face__dot"
    />
  </svg>
</template>

<style scoped>
.dice-face {
  width: 100%;
  height: 100%;
}

.dice-face__bg {
  fill: #fff;
  stroke: #1e293b;
  stroke-width: 4;
}

.dice-face__dot {
  fill: #1e293b;
}
</style>
