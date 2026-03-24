export interface KeyboardImpl {
  press(key: number): void;
  release(key: number): void;
  isPressed(key: number): boolean;
}

export default abstract class KeyboardBase<TKeyCodes extends number> implements KeyboardImpl {
  protected readonly keyState: Map<TKeyCodes, boolean> = new Map();

  protected constructor(keyMap: TKeyCodes[]) {
    for(const key of keyMap) {
      this.keyState.set(key, false);
    }
  }

  public press(key: TKeyCodes): void {
    this.keyState.set(key, true);
  }

  public release(key: TKeyCodes): void {
    this.keyState.set(key, false);
  }

  public isPressed(key: TKeyCodes): boolean {
    return this.keyState.get(key) || false;
  }
}
