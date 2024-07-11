import {Modal} from "antd";
import {CheckedOutCar} from "../../hooks/use-garage-reducer.ts";

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});
export const CheckOutSuccessDialog = (props: { open: boolean, closeModal: () => void, car: CheckedOutCar }) => {
  const {licensePlate, checkinTime, checkoutTime, fees} = props.car;
  return (<Modal
    title="Success"
    open={props.open}
    onOk={props.closeModal}
    onCancel={props.closeModal}
    cancelButtonProps={{style: {display: "none"}}}
  >
    <p>License plate: {licensePlate}</p>
    <p>Checked in at: {checkinTime.format('YYYY-MM-DD HH:mm:ss')}</p>
    <p>Checked out at: {checkoutTime.format('YYYY-MM-DD HH:mm:ss')}</p>
    <p>Fees: {currencyFormatter.format(fees)}</p>
  </Modal>);
}