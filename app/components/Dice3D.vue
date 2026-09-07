<script setup lang="ts">
/**
 * A CSS 3D cube with the six die faces glued to its sides. Rolling means
 * spinning the cube a few extra full turns and landing exactly on the
 * rotation that puts `value`'s face toward the viewer - so it looks like
 * the die actually tumbles rather than just swapping a 2D icon.
 */
const props = defineProps<{
  value: number
  spin: number
}>()

const dotPositions: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

// Opposite faces sum to 7, matching a real die.
const FACES = [
  { value: 1, transform: 'translateZ(var(--half-size))' },
  { value: 6, transform: 'rotateY(180deg) translateZ(var(--half-size))' },
  { value: 3, transform: 'rotateY(90deg) translateZ(var(--half-size))' },
  { value: 4, transform: 'rotateY(-90deg) translateZ(var(--half-size))' },
  { value: 5, transform: 'rotateX(90deg) translateZ(var(--half-size))' },
  { value: 2, transform: 'rotateX(-90deg) translateZ(var(--half-size))' },
]

function baseRotation(value: number): { x: number, y: number } {
  switch (value) {
    case 1: return { x: 0, y: 0 }
    case 6: return { x: 0, y: 180 }
    case 3: return { x: 0, y: -90 }
    case 4: return { x: 0, y: 90 }
    case 5: return { x: -90, y: 0 }
    case 2: return { x: 90, y: 0 }
    default: return { x: 0, y: 0 }
  }
}

function mod360(n: number) {
  return ((n % 360) + 360) % 360
}

const rotX = ref(0)
const rotY = ref(0)
const durationMs = ref(0)

function spinTo(value: number) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const base = baseRotation(value)

  const diffX = mod360(mod360(base.x) - mod360(rotX.value))
  const diffY = mod360(mod360(base.y) - mod360(rotY.value))

  const extraTurnsX = prefersReducedMotion ? 0 : (2 + Math.floor(Math.random() * 3)) * 360
  const extraTurnsY = prefersReducedMotion ? 0 : (2 + Math.floor(Math.random() * 3)) * 360

  durationMs.value = prefersReducedMotion ? 0 : 800 + Math.floor(Math.random() * 350)

  rotX.value += diffX + extraTurnsX
  rotY.value += diffY + extraTurnsY
}

function trigger() {
  spinTo(props.value)
}

onMounted(trigger)
watch(() => props.spin, trigger)
</script>

<template>
  <div class="dice3d" aria-hidden="true">
    <div
      class="dice3d__cube"
      :style="{
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transitionDuration: `${durationMs}ms`,
      }"
    >
      <div
        v-for="face in FACES"
        :key="face.value"
        class="dice3d__face"
        :style="{ transform: face.transform }"
      >
        <span
          v-for="(pos, i) in dotPositions[face.value]"
          :key="i"
          class="dice3d__dot"
          :style="{ left: `${pos[0]}%`, top: `${pos[1]}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dice3d {
  --die-size: clamp(4.5rem, 24vw, 7.5rem);
  --half-size: calc(var(--die-size) / 2);
  width: var(--die-size);
  height: var(--die-size);
  perspective: calc(var(--die-size) * 5);
}

.dice3d__cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
}

.dice3d__face {
  position: absolute;
  inset: 0;
  background: #fff;
  border: 3px solid #1e293b;
  border-radius: 18%;
  box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.05);
}

.dice3d__dot {
  position: absolute;
  width: 16%;
  height: 16%;
  border-radius: 50%;
  background: #1e293b;
  transform: translate(-50%, -50%);
}

@media (prefers-reduced-motion: reduce) {
  .dice3d__cube {
    transition: none;
  }
}
</style>
