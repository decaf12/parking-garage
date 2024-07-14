import {afterEach, describe, it, expect, beforeAll, vi, beforeEach} from "vitest";
import {cleanup, render} from "@testing-library/react";
import MockDate from 'mockdate';
import {CheckoutForm} from "./check-out-form.tsx";
import dayjs, {Dayjs} from "dayjs";
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

const previewFeesMock = (licensePlate: string, checkoutTime: Dayjs) => {
  if (licensePlate === 'tacos') {
    return 1;
  }

  throw new Error('No tacos');
};
describe('Render', () => {
  it('should show an empty license plate input and the current timestamp', () => {
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');
    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs())).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkoutLicensePlateErrMsg');
    const checkoutTimeErrMsg = form.queryByTestId('checkoutTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkoutTimeErrMsg).toBeNull();
  });

  it('should allow edits to license plate and timestamp', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    expect(licensePlateField.value).toBe('tacos');
    expect(dayjs(timestampField.value).isSame(dayjs('1234-01-23 23:34:45'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkoutLicensePlateErrMsg');
    const checkoutTimeErrMsg = form.queryByTestId('checkoutTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkoutTimeErrMsg).toBeNull();
  });

  it('should submit valid input', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const saveButton = form.getByTestId('checkoutSave');
    await userEvent.click(saveButton);

    expect(licensePlateField.value).toBe('');
    function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await (sleep(100));
    expect(dayjs(timestampField.value).isSame(dayjs('2024-07-01 11:12:13'))).toBe(true);

    const licensePlateErrMsg = form.queryByTestId('checkoutLicensePlateErrMsg');
    const checkoutTimeErrMsg = form.queryByTestId('checkoutTimeErrMsg');
    expect(licensePlateErrMsg).toBeNull();
    expect(checkoutTimeErrMsg).toBeNull();
  });

  it('should default the timestamp to the current time', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={(payload) => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);

    const saveButton = form.getByTestId('checkoutSave');
    await user.click(saveButton);

    const checkoutTimeErrMsg = form.queryByTestId('checkoutTimeErrMsg');
    expect(checkoutTimeErrMsg).toBeNull();
  });

  it('should show error messages for invalid input', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={() => {}}/>)

    const clearTimestampButton = form.container.querySelector('span[role="button"]');
    expect(clearTimestampButton).not.toBeNull();
    await user.click(clearTimestampButton!);

    const saveButton = form.getByTestId('checkoutSave');
    await user.click(saveButton);

    const licensePlateErrMsg = form.getByTestId('checkoutLicensePlateErrMsg');
    const checkoutTimeErrMsg = form.getByTestId('checkoutTimeErrMsg');
    expect(licensePlateErrMsg.textContent).toBe('License plate is required.');
    expect(checkoutTimeErrMsg.textContent).toBe('Invalid date.');
  });

  it('should reset all inputs and and error messages upon clicking reset', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const resetButton = form.getByTestId('checkoutReset');
    await user.click(resetButton);

    expect(licensePlateField.value).toBe('');
    expect(dayjs(timestampField.value).isSame(dayjs('2024-07-01 11:12:13'))).toBe(true);

    expect(form.queryByTestId('checkoutLicensePlateErrMsg')).toBeNull();
    expect(form.queryByTestId('checkoutTimeErrMsg')).toBeNull();

    const saveButton = form.getByTestId('checkoutSave');
    await user.click(saveButton);
    expect(form.getByTestId('checkoutLicensePlateErrMsg').textContent).toBe('License plate is required.');

    await user.click(resetButton);
    expect(form.queryByTestId('checkoutLicensePlateErrMsg')).toBeNull();
  });

  it('should show fee preview for valid inputs', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.type(licensePlateField, 'tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const feePreview = form.getByTestId('checkoutFeePreview');
    expect(feePreview.textContent).toBe('Fees: $1.00');
  });

  it('should show no fee preview for invalid inputs', async () => {
    const user = userEvent.setup();
    const form = render(<CheckoutForm previewFees={previewFeesMock} isCheckoutSuccessful={true} onSubmit={() => {}}/>)
    const licensePlateField = form.getByTestId('checkoutLicensePlate');
    const timestampField = form.getByTestId('checkoutTimestamp');

    await user.type(licensePlateField, 'no tacos');
    await user.clear(timestampField);
    await user.type(timestampField, '1234-01-23 23:34:45');

    const feePreview = form.getByTestId('checkoutFeePreview');
    expect(feePreview.textContent).toBe('Fees: --');
  });
});