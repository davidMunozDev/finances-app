"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2F7EF8", // Azul vibrante principal
      light: "#5B9BFF",
      dark: "#1E5FD9",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FFA940", // Naranja de acento
      light: "#FFB960",
      dark: "#FF9520",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#52C41A",
      light: "#73D13D",
      dark: "#389E0D",
    },
    error: {
      main: "#FF4D4F",
      light: "#FF7875",
      dark: "#CF1322",
    },
    warning: {
      main: "#FAAD14",
      light: "#FFC53D",
      dark: "#D48806",
    },
    info: {
      main: "#1890FF",
      light: "#40A9FF",
      dark: "#096DD9",
    },
    background: {
      default: "#F5F7FA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1F1F1F",
      secondary: "#8C8C8C",
      disabled: "#BFBFBF",
    },
    divider: "#E8E8E8",
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "none", // Sin mayúsculas automáticas
    },
  },
  shape: {
    borderRadius: 16, // Bordes redondeados como en las imágenes
  },
  shadows: [
    "none",
    "0px 2px 4px rgba(0, 0, 0, 0.05)",
    "0px 4px 8px rgba(0, 0, 0, 0.08)",
    "0px 8px 16px rgba(0, 0, 0, 0.1)",
    "0px 12px 24px rgba(0, 0, 0, 0.12)",
    "0px 16px 32px rgba(0, 0, 0, 0.14)",
    "0px 20px 40px rgba(0, 0, 0, 0.16)",
    "0px 2px 4px rgba(47, 126, 248, 0.1)",
    "0px 4px 8px rgba(47, 126, 248, 0.12)",
    "0px 8px 16px rgba(47, 126, 248, 0.15)",
    "0px 12px 24px rgba(47, 126, 248, 0.18)",
    "0px 16px 32px rgba(47, 126, 248, 0.2)",
    "0px 20px 40px rgba(47, 126, 248, 0.22)",
    "0px 24px 48px rgba(47, 126, 248, 0.24)",
    "0px 28px 56px rgba(47, 126, 248, 0.26)",
    "0px 32px 64px rgba(47, 126, 248, 0.28)",
    "0px 36px 72px rgba(47, 126, 248, 0.3)",
    "0px 40px 80px rgba(47, 126, 248, 0.32)",
    "0px 44px 88px rgba(47, 126, 248, 0.34)",
    "0px 48px 96px rgba(47, 126, 248, 0.36)",
    "0px 52px 104px rgba(47, 126, 248, 0.38)",
    "0px 56px 112px rgba(47, 126, 248, 0.4)",
    "0px 60px 120px rgba(47, 126, 248, 0.42)",
    "0px 64px 128px rgba(47, 126, 248, 0.44)",
    "0px 68px 136px rgba(47, 126, 248, 0.46)",
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 600,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(47, 126, 248, 0.3)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(47, 126, 248, 0.3)",
          },
        },
        sizeLarge: {
          padding: "16px 32px",
          fontSize: "1.125rem",
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
          "&:hover": {
            boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            "&:hover fieldset": {
              borderColor: "#2F7EF8",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: "0px 4px 16px rgba(47, 126, 248, 0.3)",
          "&:hover": {
            boxShadow: "0px 6px 20px rgba(47, 126, 248, 0.4)",
          },
        },
      },
    },
  },
});

export default theme;
