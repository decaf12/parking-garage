import {ParkingSpot} from "../hooks/use-garage-reducer.ts";
import {Card} from "antd";

export const ParkingSpotDetailCard = ({ parkingSpot }: {parkingSpot: ParkingSpot}) => {
  return (
    <Card data-testid='detailsCardLicensePlate' title={`License: ${parkingSpot.licensePlate}`}>
      <p data-testid='detailsCardEntryTime'>Entry time: {parkingSpot.checkinTime.format('YYYY-MM-DD HH:mm:ss')}</p>
    </Card>
  );
};