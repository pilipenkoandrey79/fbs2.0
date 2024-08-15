import { Position, OverlayToaster } from "@blueprintjs/core";

import styles from "./styles.module.scss";

const Toaster = OverlayToaster.create({
  canEscapeKeyClear: false,
  position: Position.TOP_RIGHT,
  usePortal: true,
  className: styles.toaster,
});

export { Toaster };
