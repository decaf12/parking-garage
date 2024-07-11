import {Modal} from "antd";

export const CheckOutFailureDialog = (props: { open: boolean, closeModal: () => void, errMsg: string }) => {
  return (<Modal
    title="Failed to check out"
    open={props.open}
    onOk={props.closeModal}
    onCancel={props.closeModal}
    cancelButtonProps={{style: {display: "none"}}}
    okButtonProps={{style: {backgroundColor: "red"}}}
  >
    <p>{props.errMsg}</p>
  </Modal>);
}