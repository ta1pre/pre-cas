// src/components/auth/ForcedRegistrationPopup.js

import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const ForcedRegistrationPopup = ({ open, onSubmit }) => {
  const [sex, setSex] = useState('');

  const handleSubmit = () => {
    if (sex) {
      const type = sex === 'woman' ? 'THERAPIST' : 'USER';
      onSubmit({ sex, type });
    }
  };

  return (
    <Dialog open={open} disableEscapeKeyDown>
      <DialogTitle>性別を選択してください</DialogTitle>
      <DialogContent>
        <RadioGroup value={sex} onChange={(e) => setSex(e.target.value)}>
          <FormControlLabel value="man" control={<Radio />} label="男性" />
          <FormControlLabel value="woman" control={<Radio />} label="女性" />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit} color="primary" disabled={!sex}>
          登録
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForcedRegistrationPopup;