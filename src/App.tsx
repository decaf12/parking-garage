import './App.css'
import {GarageUpdate, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {useCallback, useState} from "react";
import {ParkingForm, ParkingFormData} from "./components/parking-form.tsx";

function App() {
  const [garage, dispatch] = useGarageReducer(3);
  const [checkinErrorMsg, setCheckInErrorMsg] = useState('');

  const handleCheckin = useCallback((data: ParkingFormData) => {
    console.info('New car data', data);
    const checkInResult = dispatch({
      licensePlate: data.licensePlate,
      type: GarageUpdate.CHECK_IN,
    });

    if (checkInResult.success) {
      setCheckInErrorMsg('');
    } else {
      setCheckInErrorMsg(checkInResult.message ?? 'Error checking in.');
    }
  }, [dispatch, setCheckInErrorMsg]);

  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1)&& 's'} left</div>
      <button>Check in car</button>
      <ParkingForm timestampLabel='Entry Time' onSubmit={handleCheckin} onClear={() => console.log('cancelled')}/>
      {checkinErrorMsg && <p>{checkinErrorMsg}</p>}
      <button>Check out car</button>
      <button>Details</button>
    </>
  )
}

export default App
