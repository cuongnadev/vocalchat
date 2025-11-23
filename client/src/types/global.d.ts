export {};

declare global {
  interface Window {
    env?: {
      isElectron?: boolean;
    };
  }
}
