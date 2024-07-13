// @vitest-environment jsdom

import {describe, expect, it} from "vitest";
import {ParkingSpot, useGarageReducer} from "./use-garage-reducer.ts";
import dayjs, {Dayjs} from "dayjs";
import {act, renderHook} from "@testing-library/react";

const feeCalculatorMock = (checkin: Dayjs, checkout: Dayjs) => {
  return Math.min(checkout.diff(checkin), 123);
};

const licensePlateComparator = (car1: ParkingSpot, car2: ParkingSpot) => car1.licensePlate.localeCompare(car2.licensePlate);

describe('Initialization validation', () => {
  it('throws if there are too many occupants', () => {
    expect(() => useGarageReducer({
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
    }, feeCalculatorMock)).toThrow('Too many cars for that number of spots.');
  });

  it('throws if any occupant is missing its license plate', () => {
    expect(() => useGarageReducer({
      totalSpots: 1,
      occupants: [
        {
          licensePlate: '',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        },
      ],
    }, feeCalculatorMock)).toThrow('Missing license plate.');
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

  it('throws if the garage is full', async () => {
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

  it('can check in one car.', async () => {
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

    expect(actualResult).toStrictEqual(correctResult);
    expect(result.current.garage.occupants).toStrictEqual([correctResult]);
    expect(result.current.garage.totalSpots).toBe(2);
  });

  it('can check in multiple cars.', async () => {
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

      expect(actualResult).toStrictEqual(correctResult);
      expect(result.current.garage.totalSpots).toBe(3);

      correctOccupants.push(correctResult);

      const actualOccupantsSorted = result.current.garage.occupants.toSorted(licensePlateComparator);
      const correctOccupantsSorted = correctOccupants.toSorted(licensePlateComparator);

      expect(actualOccupantsSorted).toStrictEqual(correctOccupantsSorted);
    }

    await checkCarCheckin(2);
    await checkCarCheckin(0);
    await checkCarCheckin(1);
  });
});

describe('Check out', () => {
  it('throws if the license plate is missing.', () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 1,
      occupants: [
        {
          licensePlate: 'HAI',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        }
      ],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: '',
      timestamp: dayjs('2024-01-01 00:00:00'),
    };

    expect(() => act(() => {
      return result.current.checkout(payload);
    })).toThrow('Missing license plate.');
  });

  it('throws if the checkout timestamp is missing.', () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 10,
      occupants: [
        {
          licensePlate: 'TACOS',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        }
      ],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: 'TACOS',
      timestamp: null,
    };

    expect(() => act(() => {
      // @ts-ignore
      return result.current.checkout(payload);
    })).toThrow('Missing check out time.');
  });

  it('throws if checkout takes place before checkin.', () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 10,
      occupants: [
        {
          licensePlate: 'TACOS',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        }
      ],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: 'TACOS',
      timestamp: dayjs('2023-12-31 23:59:59'),
    };

    expect(() => act(() => {
      // @ts-ignore
      return result.current.checkout(payload);
    })).toThrow('Checkout must not take place before checkin.');
  });

  it('throws when checking out a nonexistent car.', async () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 4,
      occupants: [
        {
          licensePlate: 'HAI',
          checkinTime: dayjs('2024-01-01 00:00:00'),
        },
      ]
    }, feeCalculatorMock));

    expect(() =>act(() => {
      return result.current.checkout({
        licensePlate: 'NOT PARKED',
        timestamp: dayjs('2024-01-01 00:00:00'),
      });
    })).toThrow();
  });

  it('throws if the garage is empty', async () => {
    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 2,
      occupants: [],
    }, feeCalculatorMock));

    expect(() => act(() => {
      return result.current.checkout({
        licensePlate: 'HAI2',
        timestamp: dayjs('2024-01-02 00:00:00'),
      });
    })).toThrow('No such car is parked here.');
  });

  it('can check out if checkout time is the same as checkin time.', async () => {
    const car1 = {
      licensePlate: 'CAR1',
        checkinTime: dayjs('2024-01-01 00:00:00'),
    };
    const car2 = {
      licensePlate: 'CAR2',
      checkinTime: dayjs('2024-04-02 12:34:56'),
    };

    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 2,
      occupants: [car1, car2],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: car1.licensePlate,
      timestamp: car1.checkinTime,
    };

    const correctResult = {
        licensePlate: car1.licensePlate,
        checkinTime: car1.checkinTime,
        checkoutTime: payload.timestamp,
        fees: feeCalculatorMock(car1.checkinTime, payload.timestamp),
    };

    const actualResult = await act(() => {
      return result.current.checkout(payload);
    });

    expect(actualResult).toStrictEqual(correctResult);
    expect(result.current.garage.occupants).toStrictEqual([car2]);
    expect(result.current.garage.totalSpots).toBe(2);
  });

  it('can check out one car.', async () => {
    const car1 = {
      licensePlate: 'CAR1',
      checkinTime: dayjs('2024-01-01 00:00:00'),
    };
    const car2 = {
      licensePlate: 'CAR2',
      checkinTime: dayjs('2024-04-02 12:34:56'),
    };

    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 2,
      occupants: [car1, car2],
    }, feeCalculatorMock));

    const payload = {
      licensePlate: car1.licensePlate,
      timestamp: dayjs('2024-01-01 00:00:30'),
    };

    const correctResult = {
      licensePlate: car1.licensePlate,
      checkinTime: car1.checkinTime,
      checkoutTime: payload.timestamp,
      fees: feeCalculatorMock(car1.checkinTime, payload.timestamp),
    };

    const actualResult = await act(() => {
      return result.current.checkout(payload);
    });

    expect(actualResult).toStrictEqual(correctResult);
    expect(result.current.garage.occupants).toStrictEqual([car2]);
    expect(result.current.garage.totalSpots).toBe(2);
  });



  it('can check out multiple cars.', async () => {
    const car1: ParkingSpot = {
        licensePlate: '1',
        checkinTime: dayjs('2024-01-01 00:00:00'),
    };
    const car2: ParkingSpot = {
        licensePlate: '2',
        checkinTime: dayjs('2024-01-02 00:00:00'),
    };
    const car3: ParkingSpot = {
        licensePlate: '3',
        checkinTime: dayjs('2023-12-31 00:00:00'),
    };
    const cars = [car1, car2, car3];

    const { result } = renderHook(() => useGarageReducer({
      totalSpots: 3,
      occupants: cars,
    }, feeCalculatorMock));

    const correctOccupants: ParkingSpot[] = cars;

    const checkCarCheckout = async (car: ParkingSpot, checkoutTime: Dayjs) => {
      const correctResult = {
        ...car,
        checkoutTime,
        fees: feeCalculatorMock(car.checkinTime, checkoutTime),
      };

      const actualResult = await act(() => {
        return result.current.checkout({
          licensePlate: car.licensePlate,
          timestamp: checkoutTime,
        });
      });

      expect(actualResult).toStrictEqual(correctResult);
      expect(result.current.garage.totalSpots).toBe(3);

      const index = correctOccupants.findIndex((spot) => spot.licensePlate === car.licensePlate);
      correctOccupants.splice(index, 1);

      const actualOccupantsSorted = result.current.garage.occupants.toSorted(licensePlateComparator);
      const correctOccupantsSorted = correctOccupants.toSorted(licensePlateComparator);

      expect(actualOccupantsSorted).toStrictEqual(correctOccupantsSorted);
    }

    await checkCarCheckout(car3, car3.checkinTime.add(0, 'second'));
    await checkCarCheckout(car1, car1.checkinTime.add(30, 'second'));
    await checkCarCheckout(car2, car2.checkinTime.add(10000, 'year'));
  });
});

