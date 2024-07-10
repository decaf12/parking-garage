import './App.css'
import {GarageUpdate, useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {ParkingForm} from "./components/parking-form.tsx";

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
      <button>Details</button>
    </>
  )
}

export default App
