import {describe, expect, it} from "vitest";
import {feeCalculator} from "./fee-calculator.ts";
import dayjs, {Dayjs} from "dayjs";

describe('Exception cases', () => {
  let checkin: Dayjs;
  let checkout: Dayjs;

  it('Throws if checkout is before checkin', () => {
    checkin = dayjs('2024-01-01 00:00:00');
    checkout = dayjs('2023-12-31 23:59:59');
    expect(() => feeCalculator(checkin, checkout)).toThrowError(new Error('Checkout cannot take place before checkin.'));
  });
});

describe('Calculation', () => {
  let checkin: Dayjs;
  let checkout: Dayjs;

  it('charges $0 for 0s', () => {
    checkin = dayjs('2024-01-01 00:00:00');
    checkout = dayjs('2024-01-01 00:00:00');
    expect(feeCalculator(checkin, checkout)).toBe(0);
  });

  it('charges $1 for 1s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:00:01');

    expect(feeCalculator(checkin, checkout)).toBe(1);
  });

  it('charges $1 for 29s', () => {
      checkin = dayjs('2024-07-12 09:00:00');
      checkout = dayjs('2024-07-12 09:00:29');

      expect(feeCalculator(checkin, checkout)).toBe(1);
    });

  it('charges $1 for 30s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:00:30');

    expect(feeCalculator(checkin, checkout)).toBe(1);
  });

  it('charges $2 for 31s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:00:31');

    expect(feeCalculator(checkin, checkout)).toBe(2);
  });

  it('charges $2 for 59s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:00:59');

    expect(feeCalculator(checkin, checkout)).toBe(2);
  });

  it('charges $2 for 60s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:00');

    expect(feeCalculator(checkin, checkout)).toBe(2);
  });

  it('charges $3 for 61s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:01');

    expect(feeCalculator(checkin, checkout)).toBe(3);
  });

  it('charges $3 for 89s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:29');

    expect(feeCalculator(checkin, checkout)).toBe(3);
  });

  it('charges $3 for 90s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:30');

    expect(feeCalculator(checkin, checkout)).toBe(3);
  });

  it('charges $4 for 91s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:31');

    expect(feeCalculator(checkin, checkout)).toBe(4);
  });

  it('charges $4 for 119s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:01:59');

    expect(feeCalculator(checkin, checkout)).toBe(4);
  });

  it('charges $4 for 120s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:02:00');

    expect(feeCalculator(checkin, checkout)).toBe(4);
  });

  it('charges $4 for 121s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2024-07-12 09:02:01');

    expect(feeCalculator(checkin, checkout)).toBe(4);
  });

  it('charges $4 for >> 120s', () => {
    checkin = dayjs('2024-07-12 09:00:00');
    checkout = dayjs('2025-12-31 11:59:59');

    expect(feeCalculator(checkin, checkout)).toBe(4);
  });
});
