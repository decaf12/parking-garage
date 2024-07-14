import './App.css'
import {CheckedOutCar, ParkingSpot, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingSpotDetailCard} from "./components/parking-spot-detail-card.tsx";
import {feeCalculator} from "./services/fee-calculator.ts";
import {useEffect, useState} from "react";
import {CheckInSuccessDialog} from "./components/dialogs/check-in-success-dialog.tsx";
import {CheckInFailureDialog} from "./components/dialogs/check-in-failure-dialog.tsx";
import {CheckOutSuccessDialog} from "./components/dialogs/check-out-success-dialog.tsx";
import {CheckOutFailureDialog} from "./components/dialogs/check-out-failure-dialog.tsx";
import {Collapse} from "antd";
import {CheckinForm} from "./components/forms/check-in-form.tsx";
import {CheckoutForm} from "./components/forms/check-out-form.tsx";

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
  const {garage, checkin, checkout, previewFees} = useGarageReducer({
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

  const [activeCheckinKey, setActiveCheckinKey] = useState(['checkinForm']);
  const [activeCheckoutKey, setActiveCheckoutKey] = useState<string[]>([]);
  const [activeDetailsKey, setActiveDetailsKey] = useState<string[]>([]);

  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  useEffect(() => {
    if (!freeParkingSpotCount) {
      setActiveCheckinKey([]);
    }

    if (!garage.occupants.length) {
      setActiveCheckoutKey([]);
      setActiveDetailsKey([]);
    }
  }, [freeParkingSpotCount]);



  const checkinForm = <CheckinForm
    data-testid='checkinForm'
    isCheckinSuccessful={checkinResult.success !== false}
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
      } finally {
        setShouldShowCheckinModal(true);
      }
    }}
  />;

  const checkoutForm = <CheckoutForm
    data-testid='checkoutForm'
    isCheckoutSuccessful={checkoutResult.success !== false}
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
    previewFees={previewFees}
  />;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1) && 's'} left</div>
      <Collapse
        data-testid='checkinCollapse'
        {...freeParkingSpotCount ? {} : {collapsible: "disabled"}}
        activeKey={activeCheckinKey}
        onChange={() => setActiveCheckinKey(activeCheckinKey.length ? [] : ['checkinForm'])}
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
        data-testid='checkoutCollapse'
        {...garage.occupants.length ? {} : {collapsible: "disabled"}}
        activeKey={activeCheckoutKey}
        onChange={() => setActiveCheckoutKey(activeCheckoutKey.length ? [] : ['checkoutForm'])}
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
        data-testid='detailsCollapse'
        {...garage.occupants.length ? {} : {collapsible: "disabled"}}
        activeKey={activeDetailsKey}
        onChange={() => setActiveDetailsKey(activeDetailsKey.length ? [] : ['detailsForm'])}
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
