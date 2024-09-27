import { Button } from "antd";
import { FC, useContext } from "react";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { ApiEntities } from "@fbs2.0/types";
import { AxiosError } from "axios";

import { UserContext } from "../../../../context/userContext";
import backendUrl from "../../../../api/backend-url";
import { removeApiToken } from "../../../../utils/api-token";
import { removeRefreshToken } from "../../../../utils/refresh-token";

interface Props {
  setErrors: (errors: (Error | AxiosError | null)[] | null) => void;
}

const LoginButton: FC<Props> = ({ setErrors }) => {
  const { user, setUser } = useContext(UserContext);

  const login = async () => {
    try {
      window.open(`${backendUrl}${ApiEntities.Auth}/google`, "_self");
    } catch (error) {
      setErrors([error as Error]);
    }
  };

  const logout = () => {
    removeApiToken();
    removeRefreshToken();
    setUser(undefined);
  };

  return (
    <Button
      type="link"
      icon={user ? <LogoutOutlined /> : <UserOutlined />}
      onClick={user ? logout : login}
    />
  );
};

export { LoginButton };
