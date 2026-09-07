<script setup lang="ts">
useHead({
  htmlAttrs: { lang: 'nl' },
  title: 'Toegankelijke Dobbelsteen',
  meta: [
    { name: 'description', content: 'Een dobbelsteen-app die je bedient door een knop in te drukken, vast te houden zolang je wilt, en pas te laten rollen als je loslaat.' },
    { name: 'theme-color', content: '#1d4ed8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const MIN_DICE = 1
const MAX_DICE = 20
const STORAGE_KEY = 'dice-app:dice-count'

const diceCount = ref(2)
const results = ref<number[]>([])
const isRolling = ref(false)
const statusMessage = ref('Klaar om te rollen.')

const total = computed(() => results.value.reduce((sum, v) => sum + v, 0))

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  const parsed = saved ? Number.parseInt(saved, 10) : NaN
  if (Number.isInteger(parsed) && parsed >= MIN_DICE && parsed <= MAX_DICE) {
    diceCount.value = parsed
  }
})

watch(diceCount, (value) => {
  localStorage.setItem(STORAGE_KEY, String(value))
})

function clampCount(value: number) {
  return Math.min(MAX_DICE, Math.max(MIN_DICE, value))
}

function changeCount(delta: number) {
  diceCount.value = clampCount(diceCount.value + delta)
}

function onCountInput(e: Event) {
  const raw = Number.parseInt((e.target as HTMLInputElement).value, 10)
  if (Number.isNaN(raw)) return
  diceCount.value = clampCount(raw)
}

let rollTimeout: ReturnType<typeof setTimeout> | undefined

function roll() {
  if (rollTimeout) clearTimeout(rollTimeout)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  isRolling.value = true
  statusMessage.value = 'Bezig met rollen...'

  const finish = () => {
    results.value = Array.from(
      { length: diceCount.value },
      () => 1 + Math.floor(Math.random() * 6),
    )
    isRolling.value = false
    const list = results.value.join(', ')
    statusMessage.value =
      results.value.length === 1
        ? `Resultaat: ${results.value[0]}`
        : `Resultaten: ${list}. Totaal: ${total.value}`
  }

  if (prefersReducedMotion) {
    finish()
  } else {
    rollTimeout = setTimeout(finish, 400)
  }
}
</script>

<template>
  <main class="page">
    <h1 class="title">Dobbelsteen</h1>

    <section class="panel" aria-labelledby="count-heading">
      <h2 id="count-heading" class="panel__heading">Aantal dobbelstenen</h2>
      <div class="counter">
        <button
          type="button"
          class="counter__btn"
          :disabled="diceCount <= MIN_DICE"
          aria-label="Een dobbelsteen minder"
          @click="changeCount(-1)"
        >
          −
        </button>
        <input
          class="counter__value"
          type="number"
          inputmode="numeric"
          :min="MIN_DICE"
          :max="MAX_DICE"
          :value="diceCount"
          aria-label="Aantal dobbelstenen"
          @change="onCountInput"
        >
        <button
          type="button"
          class="counter__btn"
          :disabled="diceCount >= MAX_DICE"
          aria-label="Een dobbelsteen meer"
          @click="changeCount(1)"
        >
          +
        </button>
      </div>
    </section>

    <section class="panel" aria-labelledby="roll-heading">
      <h2 id="roll-heading" class="visually-hidden">Rollen</h2>
      <HoldToRollButton
        label="Houd ingedrukt en laat los om te rollen"
        :disabled="isRolling"
        @roll="roll"
      >
        {{ isRolling ? 'Bezig...' : 'Houd ingedrukt, laat los om te rollen' }}
      </HoldToRollButton>
      <p class="hint">
        Je kunt deze knop zo lang vasthouden als je wilt. Er gebeurt pas iets zodra je loslaat.
      </p>
    </section>

    <section class="panel" aria-labelledby="results-heading">
      <h2 id="results-heading" class="panel__heading">Resultaat</h2>
      <div v-if="results.length" class="results" :class="{ 'is-rolling': isRolling }">
        <div v-for="(value, i) in results" :key="i" class="results__die">
          <DiceFace :value="value" />
        </div>
      </div>
      <p v-else class="hint">Nog niet gerold.</p>
      <p v-if="results.length > 1" class="total">Totaal: {{ total }}</p>
      <p class="visually-hidden" role="status" aria-live="polite">{{ statusMessage }}</p>
    </section>
  </main>
</template>

<style>
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f1f5f9;
  color: #0f172a;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.page {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title {
  font-size: clamp(2rem, 6vw, 3rem);
  text-align: center;
  margin: 0.5rem 0 0;
}

.panel {
  background: #fff;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
}

.panel__heading {
  font-size: 1.25rem;
  margin: 0 0 1rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.counter {
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
}

.counter__btn {
  flex: 0 0 4.5rem;
  font-size: 2rem;
  font-weight: 700;
  border: none;
  border-radius: 1rem;
  background: #e2e8f0;
  color: #0f172a;
  cursor: pointer;
  touch-action: manipulation;
}

.counter__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.counter__btn:focus-visible,
.counter__value:focus-visible {
  outline: 4px solid #facc15;
  outline-offset: 2px;
}

.counter__value {
  flex: 1;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  border: 2px solid #cbd5e1;
  border-radius: 1rem;
  min-width: 0;
}

.hint {
  text-align: center;
  color: #475569;
  margin-top: 1rem;
  margin-bottom: 0;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
  gap: 0.75rem;
}

.results__die {
  aspect-ratio: 1;
}

.results.is-rolling {
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-4deg); }
  75% { transform: rotate(4deg); }
}

@media (prefers-reduced-motion: reduce) {
  .results.is-rolling {
    animation: none;
  }
}

.total {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1rem 0 0;
}
</style>
