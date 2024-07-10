import {produce} from "immer";
import {useReducer} from "react";

type Spot = {
  licensePlate: string,
  entryTime: number,
}

export type GarageState = {
  totalSpots: number,
  occupants: Spot[],
};

export const GarageUpdate: Record<string, string> = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
}

type GarageUpdateType = typeof GarageUpdate[keyof typeof GarageUpdate]

type GarageUpdateResult = {
  success: boolean,
  message?: string,
};

export type GarageAction = {
  type: GarageUpdateType,
  licensePlate: string,
}

const reducer = (state: GarageState, action: GarageAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case GarageUpdate.CHECK_IN:
        if (draft.occupants.length < draft.totalSpots) {
          const newSpot: Spot = {
            licensePlate: action.licensePlate,
            entryTime: Date.now(),
          };

          draft.occupants.push(newSpot);
        }
        break;

      case GarageUpdate.CHECK_OUT:
        const index = draft.occupants.findIndex((spot) => spot.licensePlate === action.licensePlate);
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

        if (!action.licensePlate.length) {
          return {
            success: false,
            message: 'Missing license plate',
          };
        }

        const index = state.occupants.findIndex((spot) => spot.licensePlate === action.licensePlate);

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
        const index = state.occupants.findIndex((spot) => spot.licensePlate === action.licensePlate);
        if (index === -1) {
          return {
            success: false,
            message: 'No such car is parked here.',
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