import {produce} from "immer";
import {useReducer} from "react";
import {Dayjs} from "dayjs";

export type ParkingSpot = {
  licensePlate: string,
  checkinTime: Dayjs,
}

export type GarageState = {
  totalSpots: number,
  occupants: ParkingSpot[],
};

enum GarageUpdate {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export type CheckedOutCar = ParkingSpot & {
  checkoutTime: Dayjs,
  fees: number,
};

export type GarageActionPayload = {
  licensePlate: string,
  timestamp: Dayjs,
}

export type GarageAction = {
  type: GarageUpdate,
  payload: GarageActionPayload
}

const reducer = (state: GarageState, action: GarageAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case GarageUpdate.CHECK_IN:
        if (draft.occupants.length < draft.totalSpots) {
          const newSpot: ParkingSpot = {
            licensePlate: action.payload.licensePlate,
            checkinTime: action.payload.timestamp,
          };

          draft.occupants.push(newSpot);
        }
        break;

      case GarageUpdate.CHECK_OUT:
        const index = draft.occupants.findIndex((spot) => spot.licensePlate === action.payload.licensePlate);
        if (index !== -1) {
          draft.occupants.splice(index, 1);
        }
        break;

      default:
        break;
    }
  });
};

export const useGarageReducer = (
  totalSpots: number,
  feeCalculator: (checkin: Dayjs, checkout: Dayjs) => number,
) : [GarageState, (payload: GarageActionPayload) => ParkingSpot, (payload: GarageActionPayload) => CheckedOutCar] => {
  const [state, dispatch] = useReducer(reducer, {
    totalSpots,
    occupants: [],
  });

  const checkin = (payload: GarageActionPayload): ParkingSpot => {
    if (state.occupants.length >= state.totalSpots) {
      throw new Error('No more spots.');
    }

    const licensePlate = payload.licensePlate;

    if (!licensePlate) {
      throw new Error('Missing license plate.');
    }

    console.info('state before lookup', state);
    const index = state.occupants.findIndex((spot) => spot.licensePlate === licensePlate);
    console.info('Car index', index);
    if (index !== -1) {
      throw new Error('This car is already parked here.');
    }

    dispatch({
      type: GarageUpdate.CHECK_IN,
      payload,
    });

    return {
      licensePlate,
      checkinTime: payload.timestamp,
    };
  };

  const checkout = (payload: GarageActionPayload): CheckedOutCar => {
    const {licensePlate, timestamp: checkoutTime} = payload;

    const spot = state.occupants.find((spot) => spot.licensePlate === licensePlate);
    if (!spot) {
      throw new Error('No such car is parked here.');
    }

    const {checkinTime} = spot;
    if (!checkoutTime.isAfter(checkinTime)) {
      throw new Error('Checkout must take place after checkin.');
    }

    dispatch({
      type: GarageUpdate.CHECK_OUT,
      payload,
    });

    return {
      licensePlate,
      checkinTime,
      checkoutTime,
      fees: feeCalculator(checkinTime, checkoutTime),
    };
  };

  return [state, checkin, checkout];
};