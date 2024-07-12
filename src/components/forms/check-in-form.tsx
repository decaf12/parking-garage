import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DatePicker, Input, Form} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {GarageActionPayload} from "../../hooks/use-garage-reducer.ts";
import {useEffect, useState} from "react";

type Props = {
  isCheckinSuccessful: boolean,
  onSubmit: (payload: GarageActionPayload) => void,
};

const checkinFormValidationSchema = z.object({
  licensePlate: z.string().min(1, {message: 'License place is required.'}),
  timestamp: z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date'),
});

const dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
export const CheckinForm = ({isCheckinSuccessful, onSubmit}: Props) => {
  const [defaultCheckinTime, setDefaultCheckinTime] = useState(dayjs());
  const {control, reset, setValue, handleSubmit, formState: {errors, isSubmitSuccessful}} = useForm<GarageActionPayload>({
    defaultValues: {
      licensePlate: '',
    },
    resolver: zodResolver(checkinFormValidationSchema),
  });

  useEffect(() => {
    if (isCheckinSuccessful && isSubmitSuccessful) {
      reset();
      setDefaultCheckinTime(dayjs());
      setValue('timestamp', dayjs(), {shouldTouch: true});
    }
  }, [isCheckinSuccessful, isSubmitSuccessful]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <Form.Item label='License Plate'>
          <Controller
            name='licensePlate'
            control={control}
            render={({ field }) => (
              <Input {...field}/>
            )}
          />
        </Form.Item>
        {errors.licensePlate && <p>{errors.licensePlate.message}</p>}
      </div>

      <div>
        <Form.Item label='Check in'>
          <Controller
            name='timestamp'
            control={control}
            defaultValue={defaultCheckinTime}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                format={dateTimeFormat}
                placeholder="Select date"
              />
            )}
          />
        </Form.Item>
        {errors.timestamp && <p>{errors.timestamp.message}</p>}
      </div>

      <button>Save</button>
      <button type='button' onClick={() => {
        reset();
      }}>
        Clear
      </button>
    </form>
  );
}