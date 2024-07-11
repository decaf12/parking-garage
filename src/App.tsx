import './App.css'
import {CheckedOutCar, ParkingSpot, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingForm} from "./components/parking-form.tsx";
import {ParkingSpotDetail} from "./components/parking-spot-detail.tsx";
import {feeCalculator} from "./services/fee-calculator.ts";
import {useState} from "react";
import {Modal} from "antd";

type CheckinResult = {
  success: true;
  spot: ParkingSpot;
} | {
  success: false;
  errorMsg: string;
} | {
  success: null;
}

type CheckoutResult = {
  success: true;
  car: CheckedOutCar;
} | {
  success: false;
  errorMsg: string;
} | {
  success: null;
}

function App() {
  const [garage, checkin, checkout] = useGarageReducer(3, feeCalculator);
  const [checkinResult, setCheckinResult] = useState<CheckinResult>({
    success: null,
  });

  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult>({
    success: null,
  });

  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1) && 's'} left</div>
      <button>Check in car</button>
      <ParkingForm
        timestampLabel='Entry Time'
        submissionSuccess={checkinResult.success !== false}
        onSubmit={(payload) => {
          try {
            const newSpot = checkin(payload);
            setCheckinResult({
              success: true,
              spot: newSpot,
            });
          } catch (e) {
            setCheckinResult({
              success: false,
              errorMsg: (e as Error).message,
            });
          }
        }}
      />
      {checkinResult.success === false && <p>{checkinResult.errorMsg}</p>}
      <button>Check out car</button>
      <ParkingForm
        timestampLabel='Exit Time'
        submissionSuccess={checkoutResult.success !== false}
        onSubmit={(payload) => {
          try {
            const checkedOutCar = checkout(payload);
            setCheckoutResult({
              success: true,
              car: checkedOutCar,
            });
          } catch (e) {
            setCheckoutResult({
              success: false,
              errorMsg: (e as Error).message,
            });
          }
        }}
      />
      {checkoutResult.success === true && <Modal title='tacos'/>}
      {checkoutResult.success === false && <p>{checkoutResult.errorMsg}</p>}
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
