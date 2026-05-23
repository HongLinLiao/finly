const MONEY_SCALE = 1_000_000;

export function toMoneyUnits(value: number) {
  return Math.round(value * MONEY_SCALE);
}

export function fromMoneyUnits(value: number) {
  return value / MONEY_SCALE;
}

export function addMoney(a: number, b: number) {
  return fromMoneyUnits(toMoneyUnits(a) + toMoneyUnits(b));
}

export function subtractMoney(a: number, b: number) {
  return fromMoneyUnits(toMoneyUnits(a) - toMoneyUnits(b));
}

export function multiplyMoney(a: number, b: number) {
  return fromMoneyUnits(Math.round(a * b * MONEY_SCALE));
}

export function divideMoney(a: number, b: number) {
  if (b === 0) return 0;

  return fromMoneyUnits(Math.round((a / b) * MONEY_SCALE));
}
