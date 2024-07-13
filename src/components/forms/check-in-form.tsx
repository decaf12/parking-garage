import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DatePicker, Form, Input} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {GarageActionPayload} from "../../hooks/use-garage-reducer.ts";
import {useEffect} from "react";

type Props = {
  isCheckinSuccessful: boolean,
  onSubmit: (payload: GarageActionPayload) => void,
};

const checkinFormValidationSchema = z.object({
  licensePlate: z.string().min(1, {message: 'License plate is required.'}),
  timestamp: z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date.'),
});

export const CheckinForm = ({isCheckinSuccessful, onSubmit}: Props) => {
  const {control, reset, setValue, handleSubmit, formState: {errors, isSubmitSuccessful}} = useForm<GarageActionPayload>({
    defaultValues: {
      licensePlate: '',
    },
    resolver: zodResolver(checkinFormValidationSchema),
  });

  useEffect(() => {
    if (isCheckinSuccessful && isSubmitSuccessful) {
      reset();
      setValue('timestamp', dayjs(), {shouldTouch: true});
    }
  }, [isCheckinSuccessful, isSubmitSuccessful]);

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Form.Item label='License Plate'>
            <Controller
              name='licensePlate'
              control={control}
              render={({field}) => (
                <Input {...field} data-testid='checkinLicensePlate'/>
              )}
            />
          </Form.Item>
          {errors.licensePlate && <p data-testid='checkinLicensePlateErrMsg'>{errors.licensePlate.message}</p>}
        </div>

        <div>
          <Form.Item label='Check in'>
            <Controller
              name='timestamp'
              control={control}
              defaultValue={dayjs()}
              render={({field}) => (
                <DatePicker
                  {...field}
                  showTime
                  format='YYYY-MM-DD HH:mm:ss'
                  placeholder="Select date"
                  data-testid='checkinTimestamp'
                />
              )}
            />
          </Form.Item>
          {errors.timestamp && <p data-testid='checkinTimeErrMsg'>{errors.timestamp.message}</p>}
        </div>

        <button data-testid='checkinSave'>Save</button>
        <button
          data-testid='checkinReset'
          type='button'
          onClick={() => {
            reset({timestamp: dayjs()});
          }}
        >
          Reset
        </button>
      </form>
    </>
  );
}