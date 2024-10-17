import { Form, Input } from "antd";
import { FC } from "react";
import { ClubDto } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import { CitySelector } from "../../../../../../../../components/selectors/CitySelector";
import { SubmitButton } from "../../../../../../../../components/SubmitButton";
import { useCreateClub } from "../../../../../../../../react-query-hooks/club/useCreateClub";
import { useCreateCity } from "../../../../../../../../react-query-hooks/city/useCreateCity";

interface Props {
  countryId: number;
  className?: string;
}

interface CustomizedClubDto extends Omit<ClubDto, "cityId"> {
  cityId: (number | string)[];
}

const AddClubForm: FC<Props> = ({ countryId, className }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<CustomizedClubDto>();
  const createCity = useCreateCity();
  const createClub = useCreateClub();

  const addCity = async (name: string) => {
    const city = await createCity.mutateAsync({ countryId, name });

    return city.id;
  };

  const submit = async (values: CustomizedClubDto) => {
    const cityId = Number(
      typeof values.cityId[0] === "string"
        ? await addCity(values.cityId[0])
        : values.cityId[0]
    );

    const clubDto: ClubDto = { name: values.name, cityId };

    await createClub.mutateAsync(clubDto);

    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="horizontal"
      onFinish={submit}
      className={className}
    >
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
