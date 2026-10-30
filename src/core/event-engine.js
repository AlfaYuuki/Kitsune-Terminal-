// Small event sequencer used by the simulation runtime.
export function createEventEngine({ interval = 820, onEvent = () => {}, onComplete = () => {} } = {}) {
  let timer = null;
  let cursor = 0;
  let events = [];
  let stopped = true;
  function stop() {
    stopped = true;
    if (timer !== null) clearTimeout(timer);
    timer = null;
  }
  function step() {
    if (stopped) return;
    if (cursor >= events.length) {
      stop();
      onComplete();
      return;
    }
    onEvent(events[cursor], cursor, events.length);
    cursor += 1;
    timer = setTimeout(step, interval);
  }
  return {
    load(nextEvents = []) { stop(); events = [...nextEvents]; cursor = 0; },
    start() { if (!events.length) { onComplete(); return; } stop(); stopped = false; step(); },
    stop,
    get position() { return cursor; }
  };
}
