export type InboundEvent = {
  receivedAt: string;
  eventType: string;
  transcript: string;
};

let lastInbound: InboundEvent | null = null;

export function storeInbound(event: InboundEvent) {
  lastInbound = event;
}

export function getInbound() {
  return lastInbound;
}
