export interface DialogConfig {
  title: string;
  subtitle?: string;
  width?: string;
  maxWidth?: string;
  closable?: boolean;
  modal?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  showFooter?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmSeverity?: string;
  confirmIcon?: string;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
}
