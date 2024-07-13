import {afterEach, describe, it, expect, beforeAll, vi} from "vitest";
import {cleanup, fireEvent, render, screen} from "@testing-library/react";
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
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkinLicensePlate');
    const timestampField = form.getByTestId('checkinTimestamp');
    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs())).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkinLicensePlateErrMsg');
    const checkinTimeErrMsg = form.queryByTestId('checkinTimeErrMsg');
    expect(licensePlateErrMsg).not.toBeInTheDocument();
    expect(checkinTimeErrMsg).not.toBeInTheDocument();
    MockDate.reset();
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
    expect(licensePlateErrMsg).not.toBeInTheDocument();
    expect(checkinTimeErrMsg).not.toBeInTheDocument();
  });

  it('should submit valid input', async () => {
    MockDate.set('2024-07-01 11:12:13');
    const user = userEvent.setup();
    const form = render(<CheckinForm isCheckinSuccessful={true} onSubmit={(payload) => {}}/>)
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
    expect(licensePlateErrMsg).not.toBeInTheDocument();
    expect(checkinTimeErrMsg).not.toBeInTheDocument();
    MockDate.reset();
  });
});