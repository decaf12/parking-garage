import {Dayjs} from "dayjs";

const blockSizeInSeconds = 30;
const feePerBlockInDollars = 1;
const maxBlocks = 4;

export const feeCalculator = (checkin: Dayjs, checkout: Dayjs) => {
  const diffInSeconds = checkout.diff(checkin, 'second');

  if (diffInSeconds <= 0) {
    return 0;
  }

  const blocksUncapped = Math.ceil(diffInSeconds / blockSizeInSeconds);
  const blocksCharged = Math.min(blocksUncapped, maxBlocks);
  return feePerBlockInDollars * blocksCharged;
};
