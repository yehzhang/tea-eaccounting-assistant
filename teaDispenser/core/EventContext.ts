interface EventContext<EC> {
  /** Globally unique ID that identifies an event. It can be used to join logs. */
  readonly eventId: string;
  readonly externalContext: EC;
}

export default EventContext;
