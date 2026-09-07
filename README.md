# Toegankelijke Dobbelsteen

Een dobbelsteen-app voor mensen die een knop niet kort/precies kunnen indrukken.

## Waarom

De meeste dobbelsteen-apps rollen zodra je de knop *aanraakt* (of vereisen een
korte, nauwkeurige tik). Bij een tremor of beperkte motoriek beweegt je vinger
tijdens het vasthouden vaak net iets te veel, waardoor de browser de tik als
"scrollen" interpreteert en niets gebeurt.

Deze app lost dat op met een knop die:

- **niets doet zolang je hem indrukt** - je kunt hem net zo lang vasthouden als nodig is,
- **pas rolt op het moment dat je loslaat**,
- bewegingen tijdens het vasthouden negeert (via [Pointer
  Capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture)),
  zodat een trillende hand de knop niet "kwijtraakt",
- geen tekstselectie, contextmenu of dubbeltik-zoom activeert tijdens het
  vasthouden,
- ook via toetsenbord (Spatie/Enter) op dezelfde manier werkt.

Zie [`app/components/HoldToRollButton.vue`](app/components/HoldToRollButton.vue)
voor de implementatie.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Deployment

Dit project is ingericht voor deployment op [Vercel](https://vercel.com) en
detecteert Nuxt automatisch (geen extra configuratie nodig).
