export function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`
}

export function makeShipmentId() {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `SH-${n}`
}

