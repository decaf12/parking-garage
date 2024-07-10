import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DatePicker, Input} from "antd";
import {useEffect} from "react";
import dayjs, {Dayjs} from "dayjs";

type Props = {
  onSubmit: SubmitHandler<FormFields>
  onCancel: () => void,
};

const parkingFormValidationSchema = z.object({
  licensePlate: z.string().min(1, {message: 'License place is required.'}),
  entryTime: z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date'),
});

type FormFields = z.infer<typeof parkingFormValidationSchema>;

export const ParkingForm = ({onSubmit, onCancel}: Props) => {
  const {control, watch, handleSubmit, formState: {errors}} = useForm<FormFields>({
    defaultValues: {
      licensePlate: '',
    },
    resolver: zodResolver(parkingFormValidationSchema),
  });

  const entryTimeVal = watch('entryTime');

  useEffect(() => {
    console.log('entry time', entryTimeVal);
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor='licensePlate'>License Plate</label>
        <Controller
          name='licensePlate'
          control={control}
          render={({ field }) => (
            <Input {...field}/>
          )}
        />

        {errors.licensePlate && <p>{errors.licensePlate.message}</p>}
      </div>

      <div>
        <label htmlFor='entryTime'>Entry Time</label>
        <Controller
          name='entryTime'
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
        {errors.entryTime && <p>{errors.entryTime.message}</p>}
      </div>

      <button>Save</button>
      <button type='button' onClick={onCancel}>Cancel</button>
    </form>
  );
}