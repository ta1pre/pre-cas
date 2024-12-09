// src/components/Login.js
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import AuthButtons from './AuthButtons';

const Login = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>ログイン</DialogTitle>
      <DialogContent>
        <p>ログインして、すべての機能にアクセスしましょう。</p>
        <AuthButtons />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default Login;