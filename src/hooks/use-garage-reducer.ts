import {produce} from "immer";
import {useReducer} from "react";
import {Dayjs} from "dayjs";

export type ParkingSpot = {
  licensePlate: string,
  entryTime: Dayjs,
}


export type GarageState = {
  totalSpots: number,
  occupants: ParkingSpot[],
};

export const GarageUpdate: Record<string, string> = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
}

export type GarageUpdateType = typeof GarageUpdate[keyof typeof GarageUpdate]

export type GarageUpdateResult = {
  success: boolean,
  message?: string,
};

export type GarageActionPayload = {
  licensePlate: string,
  timestamp: Dayjs,
}

export type GarageAction = {
  type: GarageUpdateType,
  payload: GarageActionPayload
}

const reducer = (state: GarageState, action: GarageAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case GarageUpdate.CHECK_IN:
        if (draft.occupants.length < draft.totalSpots) {
          const newSpot: ParkingSpot = {
            licensePlate: action.payload.licensePlate,
            entryTime: action.payload.timestamp,
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

export const useGarageReducer = (totalSpots: number): [GarageState, (action: GarageAction) => GarageUpdateResult] => {
  const [state, dispatch] = useReducer(reducer, {
    totalSpots,
    occupants: [],
  });

  const manager = (action: GarageAction): GarageUpdateResult => {
    switch (action.type) {
      case GarageUpdate.CHECK_IN: {
        if (state.occupants.length >= state.totalSpots) {
          return {
            success: false,
            message: 'No more spots.',
          }
        }

        if (!action.payload.licensePlate.length) {
          return {
            success: false,
            message: 'Missing license plate',
          };
        }

        const index = state.occupants.findIndex((spot) => spot.licensePlate === action.payload.licensePlate);

        if (index !== -1) {
          return {
            success: false,
            message: 'This car is already parked here.',
          };
        }

        dispatch(action);

        return {
          success: true,
        };
      }

      case GarageUpdate.CHECK_OUT: {
        const index = state.occupants.findIndex((spot) => spot.licensePlate === action.payload.licensePlate);
        if (index === -1) {
          return {
            success: false,
            message: 'No such car is parked here.',
          };
        }

        const entryTime = state.occupants[index].entryTime;
        if (!action.payload.timestamp.isAfter(entryTime)) {
          return {
            success: false,
            message: 'Checkout must take place after checkin.',
          };
        }

        dispatch(action);
        return {
          success: true,
        };
      }


      default:
        return {
          success: false,
          message: 'No such action.',
        };
    }
  };

  return [state, manager];
};