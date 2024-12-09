import React from 'react';
import { Box, Button, Container, Typography, Table, TableBody, TableRow, TableCell } from '@mui/material';

// 数値にカンマを追加する関数
const formatPoints = (points) => {
  return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const ConfirmationStep = ({ reservationData, onPrevious, onSubmit }) => {
  const { date, time, course, selectedTime, options, location, castName, selectionFee, coursePoints } = reservationData;

  // オプションの合計ポイントを計算
  const totalOptionPoints = options.reduce((total, option) => total + option.price, 0);

  // 全体の合計ポイントを計算 (コースポイント + 指名料 + オプションポイント)
  const totalPoints = (coursePoints || 0) + (selectionFee || 0) + totalOptionPoints;

  return (
    <Container maxWidth="sm" sx={{ padding: 2, overflowX: 'hidden' }}>
      {/* 見出しのスタイル調整（開業不可） */}
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: 1, whiteSpace: 'nowrap' }}>
        予約内容の確認
      </Typography>

      {/* サービス部分 */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: 0.5, backgroundColor: '#f9f9f9', padding: '0.5rem', whiteSpace: 'nowrap' }}>
          サービス情報
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>キャスト名:</strong></TableCell>
              <TableCell>{castName || '未選択'}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>予約日時:</strong></TableCell>
              <TableCell>{date ? `${date} ${time}` : '未選択'}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>コース:</strong></TableCell>
              <TableCell>{course || '未選択'}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>時間:</strong></TableCell>
              <TableCell>{selectedTime ? `${selectedTime}分` : '未選択'}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>場所:</strong></TableCell>
              <TableCell>{location || '未選択'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* 費用部分 */}
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: 0.5, backgroundColor: '#f9f9f9', padding: '0.5rem', whiteSpace: 'nowrap' }}>
          費用
        </Typography>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>指名料:</strong></TableCell>
              <TableCell align="right">{selectionFee ? `${formatPoints(selectionFee)}pt` : '未選択'}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>コース料:</strong></TableCell>
              <TableCell align="right">{coursePoints ? `${formatPoints(coursePoints)}pt` : '未選択'}</TableCell>
            </TableRow>

            {/* オプションの表示 */}
            {options.length > 0 ? options.map((option, index) => (
              <TableRow key={index}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>{option.name}(オプション):</strong></TableCell>
                <TableCell align="right">{formatPoints(option.price)}pt</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>オプション:</strong></TableCell>
                <TableCell align="right">未選択</TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>交通費:</strong></TableCell>
              <TableCell align="right">未設定</TableCell>
            </TableRow>

            {/* 合計ポイント表示 (背景色付きで他と区別) */}
            <TableRow sx={{ backgroundColor: '#fce4ec' }}>
              <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>合計:</strong></TableCell>
              <TableCell align="right" sx={{ color: 'red', fontWeight: 'bold' }}>{formatPoints(totalPoints)}pt</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* ナビゲーションボタン */}
      {/* ナビゲーションボタン */}
<Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
  <Button onClick={onPrevious} variant="outlined" sx={{ padding: '0.5rem 2rem' }}>← 戻る</Button>
  <Button onClick={onSubmit} variant="contained" sx={{ padding: '0.5rem 2rem' }}>リクエストを送信する</Button>
</Box>

{/* 「リクエストを送信する」に対する注意書き */}
<Typography variant="body2" color="error" align="right" sx={{ marginTop: 1 }}>
  ※ 予約確定ではありません
</Typography>

    </Container>
  );
};

export default ConfirmationStep;
