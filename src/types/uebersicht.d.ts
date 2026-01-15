/**
 * Type declarations for Übersicht widget framework
 */

declare module "uebersicht" {
  /**
   * Executes a shell command and returns a promise with the output
   */
  export function run(command: string): Promise<string>;

  /**
   * JSX namespace for Übersicht (uses Preact under the hood)
   */
  export namespace JSX {
    interface Element extends preact.JSX.Element {}
    interface IntrinsicElements extends preact.JSX.IntrinsicElements {}
  }
}

declare namespace preact {
  namespace JSX {
    interface Element {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
