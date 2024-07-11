import {ParkingSpot} from "../hooks/use-garage-reducer.ts";
import {Card} from "antd";

export const ParkingSpotDetailCard = ({ parkingSpot }: {parkingSpot: ParkingSpot}) => {
  return (
    <Card title={`License: ${parkingSpot.licensePlate}`}>
      <p>Entry time: {parkingSpot.checkinTime.format('YYYY-MM-DD HH:mm:ss')}</p>
    </Card>
  );
};