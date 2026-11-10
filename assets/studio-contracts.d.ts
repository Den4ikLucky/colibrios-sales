export interface StudioCopy {
  brand: string;
  sound: string;
  soundOn: string;
  videoPause: string;
  videoPlay: string;
  names: string[];
  total: string;
  perMonth: string;
  briefDue: string;
  depositNote: string;
  monthlyNote: string;
  kioskNote: string;
  briefBusiness: string;
  briefDeadline: string;
  briefRail: string;
  deliverables: string[][];
  briefTerms: string;
  copied: string;
}
interface NavigationInstance {
  destroy(): void;
}
interface AudioEngine {
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;
  unlock(): void | Promise<void>;
  click(): void;
  hover(): void;
  toggle(): void;
  select(): void;
  success(): void;
}
declare global {
  function installNavIndicator(track: HTMLElement): () => void;
  interface Window {
    StudioAudio: AudioEngine;
    MatteNavigation: { mount(element: HTMLElement): NavigationInstance };
    SLNavigationInstance: NavigationInstance;
    renderAtTime: (seconds: number) => void;
    studioFreeze?: boolean;
    Studio: {
      applyTheme(theme: string, persist?: boolean): void;
      shiftPhone(delta: number): void;
      showReader(index: number): void;
      updateProgress(): void;
      updateVideoPolicy(): void;
      readonly activePackage: string;
    };
  }
}
