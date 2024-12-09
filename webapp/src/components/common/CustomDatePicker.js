// src/components/common/CustomDatePicker.js

import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';

dayjs.locale('ja');

const CustomDatePicker = ({ label, value, onChange, disabled, error, helperText, readOnly }) => {
  // 現在の日付を基準に18年前と100年前の日付を計算
  const maxDate = dayjs().subtract(18, 'year');
  const minDate = dayjs().subtract(100, 'year');

  return (
    <LocalizationProvider 
      dateAdapter={AdapterDayjs} 
      adapterLocale="ja"
      dateFormats={{ monthAndYear: 'YYYY年MM月' }}
    >
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue) => {
            if (!readOnly || !value) {
              onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
            }
          }}
        disabled={disabled || (readOnly && value)}
        disableFuture={true}
        views={['year', 'month', 'day']}
        openTo="year"
        mask="____年__月__日"
        leftArrowButtonText="前月を表示"
        format="YYYY年MM月DD日"
        maxDate={maxDate}
        minDate={minDate}
        slotProps={{
          toolbar: {
            toolbarFormat: 'YYYY年MM月DD日',
          }, 
          calendarHeader: { format: 'YYYY年MM月' },
          textField: {
            fullWidth: true,
            margin: "normal",
            variant: "outlined",
            error: error,
            helperText: helperText,
            InputProps: {
              readOnly: readOnly && value,
            },
          },
        }}
        localeText={{
          okButtonLabel: "確定",
          cancelButtonLabel: "キャンセル",
          toolbarTitle: "日付を選択",
          datePickerToolbarTitle: "日付を選択",
          calendarWeekHeaderLabel: "日",
          leftArrowButtonText: "前月を表示",
          rightArrowButtonText: "次月を表示",
        }}
      />
    </LocalizationProvider>
  );
};

export default CustomDatePicker;