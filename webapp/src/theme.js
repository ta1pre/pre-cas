// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f777b5', // ここでAppBarの背景色を指定
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default theme;
