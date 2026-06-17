import {
  Button,
  Notification,
  createTheme,
  NumberInput,
  PasswordInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

const globalInputStyle = {
  defaultProps: {
    variant: "",
  },
  styles: (theme, params, ctx) => {
    return {
      label: {},
      input: {},
      wrapper: {},
      description: {},
    };
  },
};

const globalButtonStyles = {
  defaultProps: {
    variant: "",
  },
  styles: (theme, params, ctx) => {
    const buttonVariants = {
      primary: {},
      secondary: {},
      danger: {},
      outline: {},
    };
    return {
      root: buttonVariants[params.variant] || buttonVariants.primary,
    };
  },
};

export const theme = createTheme({
  components: {
    TextInput: TextInput.extend(globalInputStyle),
    Textarea: Textarea.extend(globalInputStyle),
    NumberInput: NumberInput.extend(globalInputStyle),
    DatePickerInput: DatePickerInput.extend(globalInputStyle),
    Select: Select.extend(globalInputStyle),
    PasswordInput: PasswordInput.extend(globalInputStyle),
    Button: Button.extend(globalButtonStyles),
    Notification: Notification.extend({
      styles: {
        root: {
          background: "#131319",
          border: "1px solid rgba(203,200,149,0.4)",
          borderRadius: 0,
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        },
        title: {
          fontFamily: "'Alexandria', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "#F6F4D3",
        },
        description: {
          fontFamily: "'Alexandria', sans-serif",
          fontSize: "12px",
          color: "#9C9A7A",
        },
        closeButton: {
          color: "#CBC895",
          borderRadius: 0,
        },
      },
    }),
  },
  fontFamily: "Vision Font, monospace, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  fontSizes: {
    xs: 'var(--font-size-xl)',
    sm: 'var(--font-size-xxl)',
    md: 'var(--font-size-default)',
    lg: 'var(--font-size-h4)',
    xl: 'var(--font-size-h3)',
  },
  defaultRadius: 0,
  primaryColor: "indigo",
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
      "#101113",
    ],
  },
});
