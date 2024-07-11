import {ParkingSpot} from "../hooks/use-garage-reducer.ts";
import {Card} from "antd";

export const ParkingSpotDetail = ({ parkingSpot }: {parkingSpot: ParkingSpot}) => {
  return (
    <Card title={`License: ${parkingSpot.licensePlate}`}>
      <p>Entry time: {parkingSpot.entryTime.format('YYYY-MM-DD HH:mm:ss')}</p>
    </Card>
  );
};