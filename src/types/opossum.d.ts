declare module "opossum" {
  import { EventEmitter } from "events";

  interface Options {
    timeout?: number;
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    rollingCountTimeout?: number;
    capacity?: number;
  }

  class CircuitBreaker extends EventEmitter {
    constructor(action: Function, options?: Options);
    fire(...args: any[]): Promise<any>;
    open(): void;
    close(): void;
    halfOpen(): void;
    readonly opened: boolean;
    readonly closed: boolean;
    readonly halfOpen: boolean;
  }

  export default CircuitBreaker;
}
