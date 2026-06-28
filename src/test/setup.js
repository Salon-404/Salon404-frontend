import '@testing-library/jest-dom'

// jsdom en este entorno no siempre expone localStorage; proveemos uno en memoria.
if (!globalThis.localStorage) {
  let store = {}
  globalThis.localStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value)
    },
    removeItem: (key) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
}
