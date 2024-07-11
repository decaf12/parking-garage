import {Modal} from "antd";
import {ParkingSpot} from "../../hooks/use-garage-reducer.ts";

export const CheckInSuccess = (props: { open: boolean, onOk: () => void, spot: ParkingSpot }) => {
  const {licensePlate, checkinTime} = props.spot;
  return <Modal
    title="Success"
    open={props.open}
    onOk={props.onOk}
    cancelButtonProps={{style: {display: "none"}}}
  >
    <p>License plate: {licensePlate}</p>
    <p>Checked in at: {checkinTime.format('YYYY-MM-DD HH:mm:ss')}</p>
  </Modal>;
}