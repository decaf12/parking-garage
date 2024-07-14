import {afterEach, describe, it, expect, beforeAll, vi, beforeEach} from "vitest";
import {cleanup, render} from "@testing-library/react";
import MockDate from 'mockdate';
import {CheckinForm} from "./check-in-form.tsx";
import dayjs from "dayjs";
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
  it('should show an empty license plate input and the current timestamp', () => {
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');
    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs())).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
  });

  it('should allow edits to license plate and timestamp', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    expect(licensePlateField.value).toBe('tacos');
    expect(dayjs(timestampField.value).isSame(dayjs('1234-01-23 23:34:45'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
  });

  it('should submit valid input', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const saveButton = form.getByTestId('checkinSave');
    await userEvent.click(saveButton);

    expect(licensePlateField.value).toBe('');
    function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await (sleep(100));
    console.info('checkin post-submit dayjs', timestampField.value);
    expect(dayjs(timestampField.value).isSame(dayjs('2024-07-01 11:12:13'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
  });

  it('should default the timestamp to the current time', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);

    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(checkinTimeErrMsg).toBeNull();
  });

  it('should show error messages for invalid input', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)

    const clearTimestampButton = form.container.querySelector('span[role="button"]');
    expect(clearTimestampButton).not.toBeNull();
    await user.click(clearTimestampButton!);

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);

    const licensePlateErrMsg = form.getByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.getByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg.textContent).toBe('License plate is required.');
    expect(checkinTimeErrMsg.textContent).toBe('Invalid date.');
  });

  it('should reset all inputs and and error messages upon clicking reset', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const resetButton = form.getByTestId('checkinReset');
    await user.click(resetButton);

    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs('2024-07-01 11:12:13'))).toBe(true);

    expect(form.queryByTestId('checkinLicensePlateErrMsg')).toBeNull();
    expect(form.queryByTestId('checkinTimeErrMsg')).toBeNull();

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);
    expect(form.getByTestId('checkinLicensePlateErrMsg').textContent).toBe('License plate is required.');

    await user.click(resetButton);
    expect(form.queryByTestId('checkinLicensePlateErrMsg')).toBeNull();
  });
});