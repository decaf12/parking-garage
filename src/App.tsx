import './App.css'
import {GarageUpdate, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingForm} from "./components/parking-form.tsx";
import {ParkingSpotDetail} from "./components/parking-spot-detail.tsx";

function App() {
  const [garage, dispatch] = useGarageReducer(3);
  const freeParkingSpotCount = garage.totalSpots - garage.occupants.length;

  return (
    <>
      <div>{freeParkingSpotCount} parking spot{(freeParkingSpotCount !== 1)&& 's'} left</div>
      <button>Check in car</button>
      <ParkingForm
        timestampLabel='Entry Time'
        getSubmissionResult={(payload) => dispatch({
          type: GarageUpdate.CHECK_IN,
          payload,
        })}
      />
      <button>Check out car</button>
      <ParkingForm
        timestampLabel='Exit Time'
        getSubmissionResult={(payload) => dispatch({
          type: GarageUpdate.CHECK_OUT,
          payload,
        })}
      />
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
