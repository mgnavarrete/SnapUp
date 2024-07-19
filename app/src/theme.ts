import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#DCA47C',
    },
    secondary: {
      main: '#FFD3B6',
    },
    background: {
      default: '#DCA47C',
    },
    text: {
      primary: '#FCF8F3',
      secondary: '#698474',
    },
  },
  typography: {
    fontFamily: 'Outfit, sans-serif',
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#FCF8F3',
          '& a': {
            color: '#FCF8F3',
            textDecoration: 'none',
            '&:hover': {
              color: '#4d3920',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#DCA47C',
          fontFamily: 'Outfit, sans-serif',
          '&:hover': {
            backgroundColor: '#f0d5b4',
            color: '#4d3920',
          },
        },
        containedPrimary: {
          color: '#DCA47C',
          backgroundColor: '#FCF8F3',
          '&:hover': {
            backgroundColor: '#4d3920',
            color: '#f0d5b4',
          },
        },
        containedSecondary: {
          color: '#DCA47C',
          backgroundColor: '#FCF8F3',
          '&:hover': {
            backgroundColor: '#4d3920',
            color: '#f0d5b4',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#EBC2A7',
          '&:hover': {
            backgroundColor: '#698474',
          },
          '&.Mui-focused': {
            backgroundColor: '#5e4a33',
          },
          '&.Mui-focused .MuiInputLabel-shrink': {
            color: '#698474',
          },
        },
        input: {
          color: '#FCF8F3',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#FCF8F3',
          '&.Mui-focused': {
            color: '#FCF8F3',
          },
          '&.MuiInputLabel-shrink': {
            color: '#FCF8F3',
          },
        },
      },
    },
  },
});

export default theme;
