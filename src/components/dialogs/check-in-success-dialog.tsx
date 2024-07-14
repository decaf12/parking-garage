import {Modal} from "antd";
import {ParkingSpot} from "../../hooks/use-garage-reducer.ts";

export const CheckInSuccessDialog = (props: { open: boolean, closeModal: () => void, spot: ParkingSpot }) => {
  const {licensePlate, checkinTime} = props.spot;
  return (<Modal
    data-testid='checkinSuccess'
    title="Success"
    open={props.open}
    onOk={props.closeModal}
    onCancel={props.closeModal}
    cancelButtonProps={{style: {display: "none"}}}
  >
    <p>License plate: {licensePlate}</p>
    <p>Checked in at: {checkinTime.format('YYYY-MM-DD HH:mm:ss')}</p>
  </Modal>);
}