import { FC, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Paths } from "../../routes";
import { saveApiToken } from "../../utils/api-token";
import { saveRefreshToken } from "../../utils/refresh-token";
import { getUser } from "../../utils/jwt";
import { Fallback } from "../Fallback";
import { UserContext } from "../../context/userContext";

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

  return <Fallback />;
};

export { AuthSuccessRedirect };
