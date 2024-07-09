import './App.css'
import {useGarageReducer} from "./hooks/use-garage-reducer.ts";
import {useState} from "react";

function App() {
  const [garage, dispatch] = useGarageReducer(3);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  return (
    <>
      <div>{garage.totalSpots - garage.occupants.length} parking spots left</div>
      <button>Check in car</button>
      <button>Check out car</button>
      <button>Details</button>
    </>
  )
}

export default App
