import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {DatePicker, Input, Form, Typography} from "antd";
import dayjs, {Dayjs} from "dayjs";
import {GarageActionPayload} from "../../hooks/use-garage-reducer.ts";
import {useEffect, useState} from "react";

type Props = {
  isCheckoutSuccessful: boolean,
  onSubmit: (payload: GarageActionPayload) => void,
  previewFees: (licensePlate: string, checkoutTime: Dayjs) => number;
};

const checkoutFormValidationSchema = z.object({
  licensePlate: z.string().min(1, {message: 'License place is required.'}),
  timestamp: z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date'),
});

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

export const CheckoutForm = ({isCheckoutSuccessful, onSubmit, previewFees}: Props) => {
  const {watch, setValue, control, reset, handleSubmit, formState: {errors, isSubmitSuccessful}} = useForm<GarageActionPayload>({
    defaultValues: {
      licensePlate: '',
    },
    resolver: zodResolver(checkoutFormValidationSchema),
  });

  const licensePlate = watch('licensePlate');
  const checkoutTime = watch('timestamp');
  const [fees, setFees] = useState<number | null>(null);

  useEffect(() => {
    try {
      const newFees = previewFees(licensePlate, checkoutTime);
      setFees(newFees);
    } catch {
      setFees(null);
    }
  }, [licensePlate, checkoutTime]);

  useEffect(() => {
    if (isCheckoutSuccessful && isSubmitSuccessful) {
      reset();
      setValue('timestamp', dayjs(), {shouldTouch: true});
    }
  }, [isCheckoutSuccessful, isSubmitSuccessful]);

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
        <Form.Item label='Check out'>
          <Controller
            name='timestamp'
            control={control}
            defaultValue={dayjs()}
            render={({ field }) => (
              <DatePicker
                {...field}
                showTime
                format='YYYY-MM-DD HH:mm:ss'
                placeholder="Select date"
              />
            )}
          />
        </Form.Item>
        {errors.timestamp && <p>{errors.timestamp.message}</p>}
      </div>
      <div style={{textAlign: 'left'}}>
        <Typography.Text>Fees: {fees === null ? '--' : currencyFormatter.format(fees)}</Typography.Text>
      </div>

      <button>Save</button>
      <button type='button' onClick={() => {reset()}}>Clear</button>
    </form>
  );
}