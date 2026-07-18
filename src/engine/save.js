// save.js — trivial because state is plain data. Versioned for future migrations.
const VERSION = 1;

export function serialize(state) {
  return JSON.stringify({ v: VERSION, state });
}

export function deserialize(json) {
  const { v, state } = JSON.parse(json);
  if (v !== VERSION) throw new Error(`Save version ${v} unsupported (engine expects ${VERSION})`);
  return state;
}
