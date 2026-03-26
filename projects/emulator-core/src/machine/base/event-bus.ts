export type EventBusLogHandler = (message: string, rawEventName?: string, rawEventDetail?: unknown) => void;

export interface EventBusImpl<TEvent extends number, TEventDetailTypeMap extends Record<TEvent, unknown>> {
  emit<K extends TEvent>(event: K, detail?: TEventDetailTypeMap[K]): void;
  subscribe(event: TEvent, listener: EventListenerOrEventListenerObject): void;
  unsubscribe(event: TEvent, listener: EventListenerOrEventListenerObject): void;
}

export default abstract class EventBusBase<TEvent extends number, TEventDetailTypeMap extends Record<TEvent, unknown>> implements EventBusImpl<TEvent, TEventDetailTypeMap> {
  protected readonly eventTarget: EventTarget = new EventTarget();

  protected constructor(
    protected readonly logger?: null | EventBusLogHandler,
    protected readonly loggerEventNameTransformer?: (event: TEvent) => string,
  ) { }

  public emit<K extends TEvent>(event: K, detail?: TEventDetailTypeMap[K]): void {
    this.eventTarget.dispatchEvent(new CustomEvent(event.toString(), { detail }));
    this.log("EMIT", event, detail);
  }

  public subscribe(event: TEvent, listener: EventListenerOrEventListenerObject): void {
    this.eventTarget.addEventListener(event.toString(), listener);
    this.log("SUBSCRIBE", event);
  }

  public unsubscribe(event: TEvent, listener: EventListenerOrEventListenerObject): void {
    this.eventTarget.removeEventListener(event.toString(), listener);
    this.log("UNSUBSCRIBE", event);
  }

  protected log(message: string, event?: TEvent, detail?: unknown): void {
    if(this.logger) {
      const eventName = event
        ? (this.loggerEventNameTransformer ? (this.loggerEventNameTransformer(event) || event.toString()) : event.toString())
        : "";

      const detailValue = detail ? (typeof detail === "number" ? `${detail} (0x${detail.toString(16).toUpperCase()})` : JSON.stringify(detail)) : "";

      this.logger(`[EventBus] "${eventName}" ${message}` + (detail ? `\n  with data: ${detailValue}` : ""), eventName, detail);
    }
  }
}
