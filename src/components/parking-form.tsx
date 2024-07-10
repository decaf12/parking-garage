import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DatePicker, Input, Form} from "antd";
import dayjs, {Dayjs} from "dayjs";

type Props = {
  timestampLabel: string,
  onSubmit: SubmitHandler<ParkingFormData>,
  onClear: () => void,
};

const parkingFormValidationSchema = z.object({
  licensePlate: z.string().min(1, {message: 'License place is required.'}),
  timestamp: z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date'),
});

export type ParkingFormData = z.infer<typeof parkingFormValidationSchema>;

export const ParkingForm = ({onSubmit, timestampLabel}: Props) => {
  const {control, reset, handleSubmit, formState: {errors}} = useForm<ParkingFormData>({
    defaultValues: {
      licensePlate: '',
    },
    resolver: zodResolver(parkingFormValidationSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        <Form.Item label={timestampLabel}>
          <Controller
            name='timestamp'
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime={{ format: 'HH:mm' }}
                format='YYYY-MM-DD HH:mm'
                placeholder="Select date"
              />
            )}
          />
        </Form.Item>
        {errors.timestamp && <p>{errors.timestamp.message}</p>}
      </div>

      <button>Save</button>
      <button type='button' onClick={() => {
        console.info('Cancelling submission');
        reset();
      }}>Clear</button>
    </form>
  );
}