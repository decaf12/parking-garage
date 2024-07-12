import './App.css'
import {CheckedOutCar, ParkingSpot, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingForm} from "./components/parking-form.tsx";
import {ParkingSpotDetailCard} from "./components/parking-spot-detail-card.tsx";
import {feeCalculator} from "./services/fee-calculator.ts";
import {useState} from "react";
import {CheckInSuccessDialog} from "./components/dialogs/check-in-success-dialog.tsx";
import {CheckInFailureDialog} from "./components/dialogs/check-in-failure-dialog.tsx";
import {CheckOutSuccessDialog} from "./components/dialogs/check-out-success-dialog.tsx";
import {CheckOutFailureDialog} from "./components/dialogs/check-out-failure-dialog.tsx";
import {Collapse} from "antd";
import {CheckinForm} from "./components/forms/check-in-form.tsx";

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
  const [garage, checkin, checkout] = useGarageReducer({
    totalSpots: 3,
    occupants: [],
    }, feeCalculator);
  const [checkinResult, setCheckinResult] = useState<CheckinResult>({
    success: null,
  });

  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult>({
    success: null,
  });

  const [shouldShowCheckinModal, setShouldShowCheckinModal] = useState(false);
  const closeCheckinModal = () => setShouldShowCheckinModal(false);

  const [shouldShowCheckoutModal, setShouldShowCheckoutModal] = useState(false);
  const closeCheckoutModal = () => setShouldShowCheckoutModal(false);

  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  const checkinForm = <CheckinForm
    isCheckinSuccessful={checkinResult.success !== false}
    onSubmit={(payload) => {
      console.info('check in payload', payload);
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
      } finally {
        setShouldShowCheckinModal(true);
      }
    }}
  />;

  const checkoutForm = <ParkingForm
    timestampLabel='Exit Time'
    passedBusinessLogicValidation={checkoutResult.success !== false}
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
      } finally {
        setShouldShowCheckoutModal(true);
      }
    }}
  />;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1) && 's'} left</div>
      <Collapse
        {...freeParkingSpotCount ? {} : {collapsible: "disabled"}}
        items={[
          {
            key: 'checkinForm',
            label: freeParkingSpotCount ? 'Check in car' : 'Cannot check in car (garage full)',
            children: (
              <>
                {checkinForm}
                {checkinResult.success === true &&
                    <CheckInSuccessDialog
                        open={shouldShowCheckinModal}
                        closeModal={closeCheckinModal}
                        spot={checkinResult.spot}
                    />}
                {checkinResult.success === false &&
                    <CheckInFailureDialog
                        open={shouldShowCheckinModal}
                        closeModal={closeCheckinModal}
                        errMsg={checkinResult.errorMsg}
                    />}
              </>
            )
          },
        ]}
        />
      <Collapse
        {...garage.occupants.length ? {} : {collapsible: "disabled"}}
        items={[
          {
            key: 'checkoutForm',
            label: garage.occupants.length ? 'Check out car' : 'No car to check out',
            children: (
              <>
                {checkoutForm}
                {checkoutResult.success === true &&
                    <CheckOutSuccessDialog
                        open={shouldShowCheckoutModal}
                        closeModal={closeCheckoutModal}
                        car={checkoutResult.car}
                    />}
                {checkoutResult.success === false &&
                    <CheckOutFailureDialog
                        open={shouldShowCheckoutModal}
                        closeModal={closeCheckoutModal}
                        errMsg={checkoutResult.errorMsg}
                    />}
              </>
            )
          },
        ]}
      />
      <Collapse
        {...garage.occupants.length ? {} : {collapsible: "disabled"}}
        items={[
          {
            key: 'details',
            label: garage.occupants.length ? 'Details' : 'No cars parked',
            children: garage.occupants.map((parkingSpot) =>
                  <ParkingSpotDetailCard
                    key={parkingSpot.licensePlate}
                    parkingSpot={parkingSpot}
                  />),
          },
        ]}
      />
    </>
  )
}

export default App
