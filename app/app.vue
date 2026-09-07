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
const ROLL_DURATION_MS = 900
const COUNT_STORAGE_KEY = 'dice-app:dice-count'
const SOUND_STORAGE_KEY = 'dice-app:sound-enabled'

const { playRollSound } = useDiceSound()

const diceCount = ref(2)
const results = ref<number[]>([])
const spin = ref(0)
const isRolling = ref(false)
const soundEnabled = ref(true)
const statusMessage = ref('Klaar om te rollen.')

const total = computed(() => results.value.reduce((sum, v) => sum + v, 0))

onMounted(() => {
  const savedCount = localStorage.getItem(COUNT_STORAGE_KEY)
  const parsed = savedCount ? Number.parseInt(savedCount, 10) : NaN
  if (Number.isInteger(parsed) && parsed >= MIN_DICE && parsed <= MAX_DICE) {
    diceCount.value = parsed
  }

  const savedSound = localStorage.getItem(SOUND_STORAGE_KEY)
  if (savedSound !== null) {
    soundEnabled.value = savedSound === 'true'
  }
})

watch(diceCount, (value) => {
  localStorage.setItem(COUNT_STORAGE_KEY, String(value))
})

watch(soundEnabled, (value) => {
  localStorage.setItem(SOUND_STORAGE_KEY, String(value))
})

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
}

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

function randomDie() {
  return 1 + Math.floor(Math.random() * 6)
}

let rollTimeout: ReturnType<typeof setTimeout> | undefined

function roll() {
  if (rollTimeout) clearTimeout(rollTimeout)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // The outcome is decided up front, like a real die - the 3D cubes just
  // spin their way to the face that was already chosen.
  results.value = Array.from({ length: diceCount.value }, randomDie)
  spin.value += 1
  isRolling.value = true
  statusMessage.value = 'Bezig met rollen...'

  if (soundEnabled.value) {
    playRollSound(ROLL_DURATION_MS / 1000)
  }

  const finish = () => {
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
    rollTimeout = setTimeout(finish, ROLL_DURATION_MS)
  }
}

onUnmounted(() => {
  if (rollTimeout) clearTimeout(rollTimeout)
})
</script>

<template>
  <main class="page">
    <section class="results-panel" aria-labelledby="results-heading">
      <h1 id="results-heading" class="title">Dobbelsteen</h1>
      <div v-if="results.length" class="results">
        <div v-for="(value, i) in results" :key="i" class="results__die">
          <Dice3D :value="value" :spin="spin" />
        </div>
      </div>
      <p v-else class="placeholder">Nog niet gerold.</p>
      <p v-if="!isRolling && results.length > 1" class="total">Totaal: {{ total }}</p>
      <p class="visually-hidden" role="status" aria-live="polite">{{ statusMessage }}</p>
    </section>

    <section class="panel mid-panel" aria-labelledby="count-heading">
      <h2 id="count-heading" class="visually-hidden">Aantal dobbelstenen</h2>
      <div class="counter">
        <button
          type="button"
          class="counter__btn"
          :disabled="diceCount <= MIN_DICE || isRolling"
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
          :disabled="isRolling"
          aria-label="Aantal dobbelstenen"
          @change="onCountInput"
        >
        <button
          type="button"
          class="counter__btn"
          :disabled="diceCount >= MAX_DICE || isRolling"
          aria-label="Een dobbelsteen meer"
          @click="changeCount(1)"
        >
          +
        </button>
      </div>
      <button
        type="button"
        class="sound-toggle"
        :aria-pressed="soundEnabled"
        @click="toggleSound"
      >
        {{ soundEnabled ? '🔊 Geluid aan' : '🔇 Geluid uit' }}
      </button>
    </section>

    <section class="roll-panel" aria-labelledby="roll-heading">
      <h2 id="roll-heading" class="visually-hidden">Rollen</h2>
      <HoldToRollButton
        size="large"
        label="Houd ingedrukt en laat los om te rollen"
        :disabled="isRolling"
        @roll="roll"
      >
        {{ isRolling ? 'Bezig...' : 'Rol' }}
      </HoldToRollButton>
      <p class="hint">
        Je kunt de knop zo lang vasthouden als je wilt. Er gebeurt pas iets zodra je loslaat.
      </p>
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
  min-height: 100dvh;
  padding: 1.25rem 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  text-align: center;
  margin: 0 0 0.5rem;
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

.results-panel {
  flex: 1 1 50vh;
  min-height: 45vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1rem 0.5rem;
}

.results {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.placeholder {
  text-align: center;
  color: #475569;
  margin: 0;
}

.total {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 1.5rem 0 0;
}

.mid-panel {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
  padding: 1rem;
}

.counter {
  flex: 1 1 12rem;
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.sound-toggle {
  flex: 0 0 auto;
}

.counter__btn {
  flex: 0 0 3.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  border: none;
  border-radius: 0.85rem;
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
  min-width: 0;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid #cbd5e1;
  border-radius: 0.85rem;
}

.sound-toggle {
  flex: 0 0 auto;
  padding: 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  border: 2px solid #cbd5e1;
  border-radius: 0.85rem;
  background: #f8fafc;
  color: #0f172a;
  cursor: pointer;
  touch-action: manipulation;
}

.sound-toggle:focus-visible {
  outline: 4px solid #facc15;
  outline-offset: 2px;
}

.roll-panel {
  flex: 0 0 auto;
  min-height: 30vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
}

.hint {
  text-align: center;
  color: #475569;
  margin: 0;
}

@media (max-width: 26rem) {
  .mid-panel {
    flex-direction: column;
  }
}
</style>
