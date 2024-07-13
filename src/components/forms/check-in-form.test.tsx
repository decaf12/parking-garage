import {afterEach, describe, it, expect, beforeAll, vi} from "vitest";
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
afterEach(cleanup);
describe('Render', () => {
  it('should show an empty license plate input and the current timestamp', () => {
    MockDate.set('2024-01-01 12:34:56');
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');
    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs())).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
    MockDate.reset();
  });

  it('should allow edits to license plate and timestamp', async () => {
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)
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

  it('should submit valid input and clear all fields if inputs pass business logic validation', async () => {
    MockDate.set('2024-07-01 11:12:13');
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);

    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs('2024-07-01 11:12:13'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
    MockDate.reset();
  });

  it('should not clear the fields if inputs pass formating validation but not business logic validaiton', async () => {
    MockDate.set('2024-07-01 11:12:13');
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={false} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);

    expect(licensePlateField.value).toBe('tacos');
    expect(dayjs(timestampField.value).isSame(dayjs('1234-01-23 23:34:45'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkinTimeErrMsg).toBeNull();
    MockDate.reset();
  });

  it('should default the timestamp to the current time', async () => {
    MockDate.set('2024-07-01 11:12:13');
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);

    const saveButton = form.getByTestId('checkinSave');
    await user.click(saveButton);

    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(checkinTimeErrMsg).toBeNull();
    MockDate.reset();
  });

  it('should show error messages for invalid input', async () => {
    MockDate.set('2024-07-01 11:12:13');
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
    MockDate.reset();
  });

  it('should reset all inputs and and error messages upon clicking reset', async () => {
    MockDate.set('2024-07-01 11:12:13');
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
    MockDate.reset();
  });
});