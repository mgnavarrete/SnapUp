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
      secondary: '#DCA47C',

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
            backgroundColor: '#5e4a33',
          },
          '&.Mui-focused': {
            backgroundColor: '#5e4a33',
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
          // Estilo base para todos los labels
          color: '#FCF8F3',
          '&.Mui-focused': {
            color: '#FCF8F3',
          },
        },
        // Estilos específicos para MuiFilledInput
        filled: {
          color: '#FCF8F3',
          '&.Mui-focused': {
            color: '#FCF8F3',
          },
          '&.MuiInputLabel-shrink': {
            color: '#FCF8F3',
          },
        },
        // Estilos específicos para MuiOutlinedInput
        outlined: {
          color: '#DCA47C',
          '&.Mui-focused': {
            color: '#DCA47C',
          },
          '&.MuiInputLabel-shrink': {
            color: '#DCA47C',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DCA47C',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DCA47C',
          },
        },
        notchedOutline: {
          borderColor: '#DCA47C',
        },
        input: {
          color: '#DCA47C',
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: '#DCA47C',
        },
      },
    },

  },
});




export default theme;
