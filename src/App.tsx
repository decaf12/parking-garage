import './App.css'
import {GarageUpdate, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingForm} from "./components/parking-form.tsx";
import {ParkingSpotDetail} from "./components/parking-spot-detail.tsx";
import {feeCalculator} from "./services/fee-calculator.ts";
import {useState} from "react";

type Result = {
  success: boolean;
  message: string;
};

function App() {
  const [garage, dispatch] = useGarageReducer(3, feeCalculator);
  const [checkinResult, setCheckinResult] = useState<Result>({
    success: true,
    message: '',
  });

  const [checkoutResult, setCheckoutResult] = useState<Result>({
    success: true,
    message: '',
  });

  const [fees, setFees] = useState(0);

  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1) && 's'} left</div>
      <button>Check in car</button>
      <ParkingForm
        timestampLabel='Entry Time'
        submissionSuccess={checkinResult.success}
        onSubmit={(payload) => {
          try {
            dispatch({
              type: GarageUpdate.CHECK_IN,
              payload,
            });
            setCheckinResult({
              success: true,
              message: '',
            })
          } catch (e) {
            setCheckinResult({
              success: false,
              message: (e as Error).message,
            });
          }
        }}
      />
      {!checkinResult.success && <p>{checkinResult.message}</p>}
      <button>Check out car</button>
      <ParkingForm
        timestampLabel='Exit Time'
        submissionSuccess={checkoutResult.success}
        onSubmit={(payload) => {
          try {
            const {fees} = dispatch({
              type: GarageUpdate.CHECK_OUT,
              payload,
            });
            setCheckoutResult({
              success: true,
              message: '',
            });

            setFees(fees ?? 0);
          } catch (e) {
            setCheckoutResult({
              success: false,
              message: (e as Error).message,
            });
          }
        }}
      />
      {!checkoutResult.success && <p>{checkoutResult.message}</p>}
      <button>Details</button>
      {garage.occupants.length
      ? garage.occupants.map((parkingSpot) =>
          <ParkingSpotDetail
            key={parkingSpot.licensePlate}
            parkingSpot={parkingSpot}
          />)
      : 'No parked cars.'}
    </>
  )
}

export default App
