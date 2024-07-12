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
  VIEW_DETAILS = 'VIEW_DETAILS',
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

const validateParkingSpot = ({licensePlate, checkinTime}: ParkingSpot) => {
  if (!licensePlate) {
    throw new Error('Missing license plate.');
  }

  if (!checkinTime) {
    throw new Error('Missing check in time.');
  }
}
const validateGarageState = ({totalSpots, occupants}: GarageState) => {
  if (totalSpots < occupants.length) {
    throw new Error('Too many cars for that number of spots.');
  }

  const licensePlates: string[] = [];

  occupants.forEach((parkingSpot) => {
    validateParkingSpot(parkingSpot);
    if (licensePlates.includes(parkingSpot.licensePlate)) {
      throw new Error('The same license plate cannot appear in multiple parking spots at the same time.');
    }
    licensePlates.push((parkingSpot.licensePlate));
  });

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
  initialState: GarageState,
  feeCalculator: (checkin: Dayjs, checkout: Dayjs) => number,
) => {
  validateGarageState(initialState)

  const [garage, dispatch] = useReducer(reducer, initialState);

  const checkin = (payload: GarageActionPayload): ParkingSpot => {
    if (garage.occupants.length >= garage.totalSpots) {
      throw new Error('No more spots.');
    }

    const licensePlate = payload.licensePlate;

    if (!licensePlate) {
      throw new Error('Missing license plate.');
    }

    if (!payload.timestamp) {
      throw new Error('Missing check in time.');
    }

    const existingCar = garage.occupants.find((spot) => spot.licensePlate === licensePlate);
    if (existingCar) {
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

    const spot = garage.occupants.find((spot) => spot.licensePlate === licensePlate);
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

  const previewFees = (licensePlate: string, checkoutTime: Dayjs): number => {
    const spot = garage.occupants.find((spot) => spot.licensePlate === licensePlate);
    if (!spot) {
      throw new Error('Car not found.');
    }

    return feeCalculator(spot.checkinTime, checkoutTime);
  }
  return {garage, checkin, checkout, previewFees};
};