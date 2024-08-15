/* eslint-disable react/jsx-no-useless-fragment */
import { Spinner } from "@blueprintjs/core";
import { AxiosError } from "axios";
import { FC, ReactNode, useEffect } from "react";
import { redirect } from "react-router-dom";

import { showError } from "../Toaster/utils";

import "./styles.module.scss";

interface Props {
  loading?: boolean;
  error?: null | string | AxiosError;
  errorRedirect?: string;
  children: ReactNode | ReactNode[];
}

const LoadOrError: FC<Props> = ({
  loading,
  children,
  error,
  errorRedirect,
}) => {
  useEffect(() => {
    if (error && errorRedirect) {
      redirect(errorRedirect);
    }
  }, [error, errorRedirect]);

  if (loading) {
    return <Spinner />;
  } else if (error) {
    showError(error);
  }

  return <>{children}</>;
};

export { LoadOrError };
