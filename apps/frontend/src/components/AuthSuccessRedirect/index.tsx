import { FC, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Spinner } from "@blueprintjs/core";

import { UserContext } from "../../context/userContext";
import { Paths } from "../../routes";
import { saveApiToken } from "../../utils/api-token";
import { saveRefreshToken } from "../../utils/refresh-token";
import { getUser } from "../../utils/jwt";

const AuthSuccessRedirect: FC = () => {
  const { accessToken, refreshToken } = useParams();
  const { setUser } = useContext(UserContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (accessToken && refreshToken) {
      saveApiToken(accessToken);
      saveRefreshToken(refreshToken);
      setUser(getUser(accessToken));
      navigate(Paths.HOME, { replace: true });
    }
  }, [accessToken, navigate, refreshToken, setUser]);

  return (
    <div>
      <Spinner />
    </div>
  );
};

export { AuthSuccessRedirect };
