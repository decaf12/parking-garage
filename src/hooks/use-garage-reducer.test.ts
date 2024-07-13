// @vitest-environment jsdom

import {describe, expect, it} from "vitest";
import {ParkingSpot, useGarageReducer} from "./use-garage-reducer.ts";
import dayjs, {Dayjs} from "dayjs";
import {act, renderHook} from "@testing-library/react";

const feeCalculatorMock = (checkin: Dayjs, checkout: Dayjs) => {
  return 1;
};

const licensePlateComparator = (car1: ParkingSpot, car2: ParkingSpot) => car1.licensePlate.localeCompare(car2.licensePlate);

describe('Initialization validation', () => {
  it('throws if there are too many occupants', () => {
    expect(() => renderHook(() => useGarageReducer({
      totalSpots: 1,
      occupants: [
        {
          licensePlate: 'car1',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        },
        {
          licensePlate: 'car2',
          checkinTime: dayjs('2024-01-02 00:00:00'),
        },
      ],
    }, feeCalculatorMock))).toThrow('Too many cars for that number of spots.');
  });

  it('throws if any occupant is missing its license plate', () => {
    expect(() => renderHook(() => useGarageReducer({
      totalSpots: 1,
      occupants: [
        {
          licensePlate: '',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        },
      ],
    }, feeCalculatorMock))).toThrow('Missing license plate.');
  });
});
describe('Check in', () => {
  it('throws if the license plate is missing.', () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 1,
      occupants: [],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: '',
      timestamp: dayjs('2024-01-01 00:00:00'),
    };

    expect(() => act(() => {
      return result.current.checkin(payload);
    })).toThrow('Missing license plate.');
  });

  it('throws if the check in timestamp is missing.', () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 10,
      occupants: [],
    }, feeCalculatorMock));
    const payload = {
      licensePlate: 'TACOS',
      timestamp: null,
    };

    expect(() => act(() => {
      // @ts-ignore
      return result.current.checkin(payload);
    })).toThrow('Missing check in time.');
  });

  it('throws when checking in an already-parked car.', async () => {
    const car = {
      licensePlate: 'HAI',
      timestamp: dayjs('2024-01-01 00:00:00'),
    };
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 4,
      occupants: [
        {
          licensePlate: car.licensePlate,
          checkinTime: car.timestamp,
        }
      ]
    }, feeCalculatorMock));

    expect(() =>act(() => {
      return result.current.checkin(car);
    })).toThrow();
  });

  it('Cannot check in if the garage is full', async () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 1,
      occupants: [
        {
          licensePlate: 'HAI',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        },
      ]
    }, feeCalculatorMock));

    const car2 = {
      licensePlate: 'HAI2',
      timestamp: dayjs('2024-01-02 00:00:00'),
    };

    expect(() => act(() => {
      return result.current.checkin(car2);
    })).toThrow('No more spots.');
  });

  it('Can check in one car.', async () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 2,
      occupants: [],
    }, feeCalculatorMock));
    const payload = {
      licensePlate: 'HAI',
      timestamp: dayjs('2024-01-01 00:00:00'),
    };

    const correctResult = {
      licensePlate: payload.licensePlate,
      checkinTime: payload.timestamp,
    }

    const actualResult = await act(() => {
      return result.current.checkin(payload);
    });

    expect(actualResult).toEqual(correctResult);
    expect(result.current.garage.occupants).toEqual([correctResult]);
    expect(result.current.garage.totalSpots).toBe(2);
  });

  it('Can check in multiple cars.', async () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 3,
      occupants: [],
    }, feeCalculatorMock));
    const cars = [
      {
        licensePlate: '1',
        timestamp: dayjs('2024-01-01 00:00:00'),
      },
      {
        licensePlate: '2',
        timestamp: dayjs('2024-01-02 00:00:00'),
      },
      {
        licensePlate: '3',
        timestamp: dayjs('2023-12-31 00:00:00'),
      },
    ];

    const correctOccupants: ParkingSpot[] = [];

    const checkCarCheckin = async (index: number) => {
      const car = cars[index];
      const correctResult = {
        licensePlate: car.licensePlate,
        checkinTime: car.timestamp,
      }

      const actualResult = await act(() => {
        return result.current.checkin(car);
      });

      expect(actualResult).toEqual(correctResult);
      expect(result.current.garage.totalSpots).toBe(3);

      correctOccupants.push(correctResult);

      const actualOccupantsSorted = result.current.garage.occupants.toSorted(licensePlateComparator);
      const correctOccupantsSorted = correctOccupants.toSorted(licensePlateComparator);

      expect(actualOccupantsSorted).toEqual(correctOccupantsSorted);
    }

    await checkCarCheckin(2);
    await checkCarCheckin(0);
    await checkCarCheckin(1);
  });
});
