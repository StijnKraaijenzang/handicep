<script setup lang="ts">
/**
 * Accessible "hold and release" button.
 *
 * Regular buttons fire on tap/click, which on touch devices requires the
 * finger to stay almost perfectly still between touchstart and touchend -
 * if it moves too much (e.g. due to a tremor) the browser cancels the tap
 * and nothing happens. This button instead captures the pointer on press,
 * so it can be held down for any length of time, moved around, and will
 * only trigger the "roll" event on release - never on press.
 */
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    label?: string
    size?: 'default' | 'large'
  }>(),
  {
    disabled: false,
    label: 'Rol',
    size: 'default',
  },
)

const emit = defineEmits<{
  roll: []
}>()

const isPressed = ref(false)
const buttonEl = ref<HTMLButtonElement | null>(null)

function activate(e: PointerEvent | KeyboardEvent) {
  if (props.disabled || isPressed.value) return
  isPressed.value = true
  if ('pointerId' in e && buttonEl.value) {
    try {
      buttonEl.value.setPointerCapture(e.pointerId)
    } catch {
      // ignore - not all pointer types support capture
    }
  }
}

function release(e?: PointerEvent | KeyboardEvent) {
  if (!isPressed.value) return
  isPressed.value = false
  if (e && 'pointerId' in e && buttonEl.value?.hasPointerCapture(e.pointerId)) {
    buttonEl.value.releasePointerCapture(e.pointerId)
  }
  if (!props.disabled) emit('roll')
}

function cancel(e?: PointerEvent | KeyboardEvent) {
  isPressed.value = false
  if (e && 'pointerId' in e && buttonEl.value?.hasPointerCapture(e.pointerId)) {
    buttonEl.value.releasePointerCapture(e.pointerId)
  }
}

function onPointerDown(e: PointerEvent) {
  e.preventDefault()
  activate(e)
}

function onPointerUp(e: PointerEvent) {
  e.preventDefault()
  release(e)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key !== ' ' && e.key !== 'Enter') return
  e.preventDefault()
  if (!e.repeat) activate(e)
}

function onKeyUp(e: KeyboardEvent) {
  if (e.key !== ' ' && e.key !== 'Enter') return
  e.preventDefault()
  release(e)
}
</script>

<template>
  <button
    ref="buttonEl"
    type="button"
    class="hold-button"
    :class="{ 'is-pressed': isPressed, 'hold-button--large': size === 'large' }"
    :disabled="disabled"
    :aria-pressed="isPressed"
    :aria-label="label"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="cancel"
    @keydown="onKeyDown"
    @keyup="onKeyUp"
    @contextmenu.prevent
    @click.prevent
  >
    <span class="hold-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.hold-button {
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  border: none;
  border-radius: 1.25rem;
  background: #1d4ed8;
  color: #fff;
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  font-weight: 700;
  padding: 1rem 1.25rem;
  width: 100%;
  min-height: 5rem;
  cursor: pointer;
  transition: transform 0.08s ease, background-color 0.08s ease, box-shadow 0.08s ease;
  box-shadow: 0 5px 0 #1e3a8a;
}

.hold-button--large {
  font-size: clamp(1.75rem, 7vw, 2.75rem);
  border-radius: 1.75rem;
  min-height: clamp(7rem, 27vh, 11rem);
  box-shadow: 0 8px 0 #1e3a8a;
}

.hold-button:disabled {
  background: #94a3b8;
  box-shadow: 0 5px 0 #64748b;
  cursor: not-allowed;
}

.hold-button.is-pressed {
  background: #15803d;
  transform: translateY(3px);
  box-shadow: 0 2px 0 #14532d;
}

.hold-button--large.is-pressed {
  transform: translateY(5px);
  box-shadow: 0 3px 0 #14532d;
}

.hold-button:focus-visible {
  outline: 4px solid #facc15;
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .hold-button {
    transition: none;
  }
}
</style>
