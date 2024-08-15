import {
  Alignment,
  Button,
  Classes,
  Icon,
  IconName,
  Navbar,
} from "@blueprintjs/core";
import { ApiEntities } from "@fbs2.0/types";
import { FC, ReactNode, useContext } from "react";
import classNames from "classnames";

import { UserContext } from "../../context/userContext";
import { useCurrentPath } from "../../hooks/useCurrentPath";
import { Paths } from "../../routes";
import backendUrl from "../../api/backend-url";
import { showError } from "../Toaster/utils";
import { removeRefreshToken } from "../../utils/refresh-token";
import { removeApiToken } from "../../utils/api-token";

import styles from "./styles.module.scss";

export type HeaderNavLink = {
  to: string;
  label: string;
  icon?: IconName;
};

interface Props {
  navLinks?: HeaderNavLink[];
  children: ReactNode | ReactNode[];
}

const Page: FC<Props> = ({ children, navLinks }) => {
  const { user, setUser } = useContext(UserContext);
  const currentPath = useCurrentPath();
  const home = currentPath === Paths.HOME;
  const isClubsPage = currentPath === Paths.CLUBS;

  const login = async () => {
    try {
      window.open(`${backendUrl}${ApiEntities.Auth}/google`, "_self");
    } catch (e) {
      showError(e as Error);
    }
  };

  const logout = () => {
    removeApiToken();
    removeRefreshToken();
    setUser(undefined);
  };

  return (
    <div className={classNames(styles.page, { [styles.home]: home })}>
      <Navbar className={classNames(Classes.DARK, styles.navbar)} fixedToTop>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Футбольна статистика</Navbar.Heading>
          <Navbar.Divider />
          {!home && (
            <a href="/" className={styles.link}>
              <Icon icon="home" className={styles.icon} />
              <span>Головна</span>
            </a>
          )}
          {navLinks?.map(({ to, label, icon }) => (
            <a key={to} href={to} className={styles.link}>
              {icon && <Icon icon={icon} className={styles.icon} />}
              {label}
            </a>
          ))}
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          {!isClubsPage && (
            <a href="/clubs" className={styles.link}>
              <Icon icon="globe" className={styles.icon} />
              Клуби, міста, країни
            </a>
          )}

          <Button
            icon={user ? "log-out" : "log-in"}
            className={styles.icon}
            minimal
            onClick={user ? logout : login}
          />
        </Navbar.Group>
      </Navbar>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export { Page };
