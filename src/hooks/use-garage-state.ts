import {produce} from "immer";

type Spot = {
  licensePlate: string,
  entryTime: number,
}

type GarageState = {
  totalSpots: number,
  occupants: Spot[],
};

const GarageUpdateDispatch: Record<string, string> = {
  CHECK_IN: 'CHECK_IN',
  CHECK_OUT: 'CHECK_OUT',
}

type GarageUpdateDispatchType = typeof GarageUpdateDispatch[keyof typeof GarageUpdateDispatch]

export type GarageUpdateDispatchAction = {
  type: GarageUpdateDispatchType,
  payload: {
    licensePlate: string,
  },
}

const reducer = (state: GarageState, action: GarageUpdateDispatchAction) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case GarageUpdateDispatch.CHECK_IN:
        if (draft.occupants.length < draft.totalSpots) {
          const newSpot: Spot = {
            licensePlate: action.payload.licensePlate,
            entryTime: Date.now(),
          };

          draft.occupants.push(newSpot);
        }
        break;

      case GarageUpdateDispatch.CHECK_OUT:
        const index = draft.occupants.findIndex((spot) => spot.licensePlate === action.payload.licensePlate);
        if (index !== -1) {
          draft.occupants.splice(index, 1);
        }
        break;

      default:
        break;
    }
  });
}