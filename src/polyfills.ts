import { Platform } from 'react-native';

if (Platform.OS !== 'web' && typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
}
