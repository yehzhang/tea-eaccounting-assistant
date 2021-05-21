interface EventContext {
  /** Globally unique ID that identifies an event. It can be used to join logs. */
  readonly eventId: string;
}

export default EventContext;
