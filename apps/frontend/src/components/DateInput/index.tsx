import { DateInput as BlueprintDateInput } from "@blueprintjs/datetime";
import { Years } from "@fbs2.0/types";
import { DateTime } from "luxon";
import { FC } from "react";

const formatDate = (date: Date) => DateTime.fromJSDate(date).toISODate() ?? "";
const parseDate = (str: string) => new Date(str);

interface Props {
  setDate: (value: string | null) => void;
  value: string | null;
  disabled?: boolean;
}

const DateInput: FC<Props> = ({ value, setDate, disabled = false }) => (
  <BlueprintDateInput
    formatDate={formatDate}
    onChange={setDate}
    parseDate={parseDate}
    placeholder="YYYY-MM-DD"
    value={value}
    disabled={disabled}
    minDate={new Date(Years.GLOBAL_START, 0, 1)}
  />
);

export { DateInput };
