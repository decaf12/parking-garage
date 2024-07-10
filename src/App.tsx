import './App.css'
import {useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {ParkingForm} from "./components/parking-form.tsx";

function App() {
  const [garage, dispatch] = useGarageReducer(3);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  return (
    <>
      <div>{garage.totalSpots - garage.occupants.length} parking spots left</div>
      <button>Check in car</button>
      <ParkingForm onSubmit={(data) => console.log('parking form data', data)} onCancel={() => console.log('cancelled')}/>
      <button>Check out car</button>
      <button>Details</button>
    </>
  )
}

export default App
