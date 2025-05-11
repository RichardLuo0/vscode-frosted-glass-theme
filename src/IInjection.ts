export interface IInjection {
  inject(): Promise<void>;
  restore(): Promise<void>;
}
