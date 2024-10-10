import { FC, useEffect, useState } from "react";
import { Button, Form, FormInstance } from "antd";
import { SaveOutlined } from "@ant-design/icons";

interface Props {
  form: FormInstance | undefined;
  label?: string;
  loading?: boolean;
  size?: "large" | "middle" | "small";
  className?: string;
  forceDisabled?: boolean;
}

const SubmitButton: FC<Props> = ({
  form,
  label,
  loading,
  size,
  className,
  forceDisabled,
}) => {
  const [disabled, setDisabled] = useState(true);

  const values = Form.useWatch([], form);

  useEffect(() => {
    setDisabled(true);

    form?.validateFields({ validateOnly: true }).then(
      () => {
        setDisabled(false);
      },
      () => null
    );
  }, [form, values]);

  return (
    <Form.Item className={className}>
      <Button
        type="primary"
        htmlType="submit"
        size={size || "large"}
        disabled={disabled || forceDisabled}
        loading={loading}
        role="button"
        icon={<SaveOutlined />}
        title={label}
      >
        {label}
      </Button>
    </Form.Item>
  );
};

export { SubmitButton };
