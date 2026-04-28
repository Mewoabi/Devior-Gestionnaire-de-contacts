// Configuration globale des tests — importation des matchers jest-dom
import '@testing-library/jest-dom';

// Mock de ResizeObserver — absent dans jsdom, requis par MUI DataGrid et X-Virtualizer
// Doit être une classe (constructeur) et non une fonction fléchée
class ResizeObserverMock {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
