import {afterEach, describe, expect, it} from "vitest";
import {cleanup, render} from "@testing-library/react";
import {ParkingSpotDetailCard} from "./parking-spot-detail-card.tsx";
import dayjs from "dayjs";
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
afterEach(cleanup);
describe('Parking spot detail card test', () => {
  it('should show license plate and timestamp', () => {
    const card = render(<ParkingSpotDetailCard parkingSpot={{
      licensePlate: 'TEST',
      checkinTime: dayjs('2014-01-01 00:00:00'),
    }}/>);

    expect(card.getByTestId('detailsCardLicensePlate')).toHaveTextContent('License: TEST');
    expect(card.getByTestId('detailsCardEntryTime')).toHaveTextContent('Entry time: 2014-01-01 00:00:00');
  });
});