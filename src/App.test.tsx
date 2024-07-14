import {afterEach, describe, it, expect, beforeAll, vi, beforeEach} from "vitest";
import {cleanup, render} from "@testing-library/react";
import MockDate from 'mockdate';
import App from './App.tsx'
import * as matchers from '@testing-library/jest-dom/matchers';
import userEvent from "@testing-library/user-event";

expect.extend(matchers);
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => {
  MockDate.set('2024-07-01 11:12:13');
});
afterEach(() => {
  MockDate.reset();
  cleanup();
});

describe('Render', () => {
  it('should show all sections collapsed, with only checkin expandable.', () => {
    const app = render(<App/>);

    const parkingSpotCounter = app.getByTestId('parkingSpotCounter');
    expect(parkingSpotCounter.textContent).toBe('3 parking spots left');

    const checkinCollapse = app.getByTestId('checkinCollapse').querySelector('div[class^="ant-collapse-item"]');
    const checkoutCollapse = app.getByTestId('checkoutCollapse').querySelector('div[class^="ant-collapse-item"]');
    const detailsCollapse = app.getByTestId('detailsCollapse').querySelector('div[class^="ant-collapse-item"]');

    expect(checkinCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');
    expect(detailsCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');

    const checkinCollapseHeader = checkinCollapse?.querySelector('span[class="ant-collapse-header-text"]');
    const checkoutCollapseHeader = checkoutCollapse?.querySelector('span[class="ant-collapse-header-text"]');
    const detailsCollapseHeader = detailsCollapse?.querySelector('span[class="ant-collapse-header-text"]');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('No car to check out');
    expect(detailsCollapseHeader?.textContent).toBe('No cars parked');
  });

  it('should correctly update counters and Collapses when adding and removing cars.', async () => {
    const user = userEvent.setup()
    const app = render(<App/>);

    const parkingSpotCounter = app.getByTestId('parkingSpotCounter');
    const checkinCollapse = app.getByTestId('checkinCollapse').querySelector('div[class^="ant-collapse-item"]');
    const checkoutCollapse = app.getByTestId('checkoutCollapse').querySelector('div[class^="ant-collapse-item"]');
    const detailsCollapse = app.getByTestId('detailsCollapse').querySelector('div[class^="ant-collapse-item"]');

    const checkinCollapseHeader = checkinCollapse?.querySelector('span[class="ant-collapse-header-text"]');
    const checkoutCollapseHeader = checkoutCollapse?.querySelector('span[class="ant-collapse-header-text"]');
    const detailsCollapseHeader = detailsCollapse?.querySelector('span[class="ant-collapse-header-text"]');

    const checkinFormLicensePlate = app.getByTestId('checkinLicensePlate');
    const checkinSave = app.getByTestId('checkinSave');

    await user.type(checkinFormLicensePlate, 'car1');
    await user.click(checkinSave);
    await user.click(app.getByText('OK', {selector: 'span'}));

    expect(parkingSpotCounter.textContent).toBe('2 parking spots left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item');
    expect(detailsCollapse?.className).toBe('ant-collapse-item');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('Check out car');
    expect(detailsCollapseHeader?.textContent).toBe('Details');

    await user.type(checkinFormLicensePlate, 'car2');
    await user.click(checkinSave);
    await user.click(app.getByText('OK', {selector: 'span'}));

    expect(parkingSpotCounter.textContent).toBe('1 parking spot left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item');
    expect(detailsCollapse?.className).toBe('ant-collapse-item');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('Check out car');
    expect(detailsCollapseHeader?.textContent).toBe('Details');

    await user.type(checkinFormLicensePlate, 'car3');
    await user.click(checkinSave);
    await user.click(app.getByText('OK', {selector: 'span'}));

    expect(parkingSpotCounter.textContent).toBe('0 parking spots left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item');
    expect(detailsCollapse?.className).toBe('ant-collapse-item');

    expect(checkinCollapseHeader?.textContent).toBe('Cannot check in car (garage full)');
    expect(checkoutCollapseHeader?.textContent).toBe('Check out car');
    expect(detailsCollapseHeader?.textContent).toBe('Details');

    await user.click(app.getByText('Check out car', {selector: 'span'}));
    await user.click(app.getByText('OK', {selector: 'span'}));

    const checkoutFormLicensePlate = app.getByTestId('checkoutLicensePlate');
    const checkoutSave = app.getByTestId('checkoutSave');
    const checkoutReset = app.getByTestId('checkoutReset');
    await user.click(checkoutReset);

    await user.type(checkoutFormLicensePlate, 'car1');
    await user.click(checkoutSave);

    expect(parkingSpotCounter.textContent).toBe('1 parking spot left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(detailsCollapse?.className).toBe('ant-collapse-item');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('Check out car');
    expect(detailsCollapseHeader?.textContent).toBe('Details');

    await user.click(checkoutReset);
    await user.type(checkoutFormLicensePlate, 'car2');
    await user.click(checkoutSave);

    expect(parkingSpotCounter.textContent).toBe('2 parking spots left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(detailsCollapse?.className).toBe('ant-collapse-item');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('Check out car');
    expect(detailsCollapseHeader?.textContent).toBe('Details');

    await user.click(checkoutReset);
    await user.type(checkoutFormLicensePlate, 'car3');
    await user.click(checkoutSave);

    expect(parkingSpotCounter.textContent).toBe('3 parking spots left');
    expect(checkinCollapse?.className).toBe('ant-collapse-item');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');
    expect(detailsCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');

    expect(checkinCollapseHeader?.textContent).toBe('Check in car');
    expect(checkoutCollapseHeader?.textContent).toBe('No car to check out');
    expect(detailsCollapseHeader?.textContent).toBe('No cars parked');
  });
});