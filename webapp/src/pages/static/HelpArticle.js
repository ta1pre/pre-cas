// src/pages/help/HelpArticle.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Typography, Container, Box, CircularProgress, Button, Paper } from '@mui/material';
import { client } from '../../api/microcms';

const HelpArticle = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await client.get({
          endpoint: 'help',
          contentId: articleId,
        });
        setArticle(res);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!article) return <Typography>Article not found</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Button component={Link} to="/help" variant="outlined" sx={{ marginBottom: '20px' }}>
          記事一覧に戻る
        </Button>
        <Paper elevation={3} sx={{ padding: '2rem', marginTop: '1rem' }}>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{
              borderBottom: '3px solid #000',
              paddingBottom: '0.3em',
              marginBottom: '1em',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {article.title}
          </Typography>
          
          {/* コンテンツ表示、画像のスタイルは残しつつテーブルのスタイル適用 */}
          <Box
            sx={{
              '& figure': {
                margin: 0,
                padding: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              },
              '& figure img': {
                maxWidth: '100%',
                height: 'auto',
              },
              // テーブルのスタイルを適用
              '& table': {
                display: 'block',
                overflowX: 'auto',
                minWidth: '100%', // 最小幅を画面幅に設定
                borderCollapse: 'collapse',
                border: '1px solid #ddd',
              },
              '& table tbody': {
                display: 'table', // tbodyのスタイル
                width: '100%',
              },
              '& th, & td': {
                padding: '8px',
                border: '1px solid #ddd',
                textAlign: 'left',
              },
              '& th': {
                backgroundColor: '#f4f4f4',
                fontWeight: 'bold',
              },
              // 一番左のセルの改行を防止
              '& tr > th:first-of-type, & tr > td:first-of-type': {
                whiteSpace: 'nowrap',
              },
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HelpArticle;
