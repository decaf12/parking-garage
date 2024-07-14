import {afterEach, describe, it, expect, beforeAll, vi, beforeEach} from "vitest";
import {cleanup, render} from "@testing-library/react";
import MockDate from 'mockdate';
import App from './App.tsx'
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
  it('Shows all sections collapsed, with only checkin expandable.', async () => {
    const app = render(<App/>);

    const checkinCollapse = app.getByTestId('checkinCollapse').querySelector('div[class^="ant-collapse-item"]');
    const checkoutCollapse = app.getByTestId('checkoutCollapse').querySelector('div[class^="ant-collapse-item"]');
    const detailsCollapse = app.getByTestId('detailsCollapse').querySelector('div[class^="ant-collapse-item"]');

    expect(checkinCollapse?.className).toBe('ant-collapse-item ant-collapse-item-active');
    expect(checkoutCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');
    expect(detailsCollapse?.className).toBe('ant-collapse-item ant-collapse-item-disabled');
    expect(1).toBe(1);
  });
});