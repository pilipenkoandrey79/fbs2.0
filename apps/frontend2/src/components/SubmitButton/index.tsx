import { FC, useEffect, useState } from "react";
import { Button, Form, FormInstance } from "antd";
import { SaveOutlined } from "@ant-design/icons";

interface Props {
  form: FormInstance | undefined;
  label?: string;
  loading?: boolean;
  size?: "large" | "middle" | "small";
  className?: string;
}

const SubmitButton: FC<Props> = ({ form, label, loading, size, className }) => {
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
        disabled={disabled}
        loading={loading}
        role="button"
        icon={<SaveOutlined />}
        title={label}
      />
    </Form.Item>
  );
};

export { SubmitButton };