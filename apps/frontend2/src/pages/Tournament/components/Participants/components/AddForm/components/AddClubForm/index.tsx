import { Form, Input, message } from "antd";
import { FC } from "react";
import { ClubDto } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { CitySelector } from "../../../../../../../../components/selectors/CitySelector";
import { SubmitButton } from "../../../../../../../../components/SubmitButton";
import { useCreateClub } from "../../../../../../../../react-query-hooks/club/useCreateClub";

interface Props {
  countryId: number;
  className?: string;
}

const AddClubForm: FC<Props> = ({ countryId, className }) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm<ClubDto>();
  const createClub = useCreateClub();

  const submit = async (values: ClubDto) => {
    try {
      await createClub.mutateAsync(values);

      form.resetFields();

      messageApi.open({
        type: "success",
        content: t("tournament.participants.list.club_added"),
      });
    } catch (error) {
      messageApi.open({
        type: "error",
        content: typeof error === "string" ? error : (error as Error).message,
      });
    }
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={submit}
      className={className}
    >
      {contextHolder}
      <CitySelector countryId={countryId} />
      <Form.Item
        name="name"
        rules={[
          { required: true, message: t("common.placeholder.enter_name") },
        ]}
      >
        <Input size="small" placeholder={t("common.placeholder.enter_name")} />
      </Form.Item>
      <SubmitButton form={form} size="small" loading={createClub.isPending} />
    </Form>
  );
};

export { AddClubForm };
