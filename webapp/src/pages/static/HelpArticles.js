// src/pages/static/HelpArticles.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../../api/microcms';
import { 
  Typography, Container, Box, CircularProgress, Tabs, Tab,
  List, ListItem, ListItemText, ListItemIcon, Paper
} from '@mui/material';
import { 
  HelpOutline, QuestionAnswer, Face, EmojiPeople, ChevronRight
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const HelpArticles = () => {
  const { userProfile } = useContext(AuthContext);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('common');

  const categories = [
    { id: 'common', label: '共通', icon: HelpOutline },
    { id: 'common_q', label: '共通Q&A', icon: QuestionAnswer },
    { id: 'guest', label: 'ゲスト', icon: HelpOutline },
    { id: 'guest_q', label: 'ゲストQ&A', icon: QuestionAnswer },
    { id: 'cast', label: 'キャスト', icon: Face, condition: userProfile?.userSex === 'woman' },    
    { id: 'cast_q', label: 'キャストQ&A', icon: EmojiPeople, condition: userProfile?.userSex === 'woman' },
  ];

  const getVisibleCategories = useCallback(() => 
    categories.filter(category => category.condition === undefined || category.condition),
    [userProfile]
  );

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const visibleCategories = getVisibleCategories();
        const fetchPromises = visibleCategories.map(async category => {
          const res = await client.get({
            endpoint: 'help',
            queries: { filters: `category[equals]${category.id}` }
          });
          return { [category.id]: res.contents };
        });

        const results = await Promise.all(fetchPromises);
        const combinedArticles = Object.assign({}, ...results);
        setArticles(combinedArticles);
        
        if (!visibleCategories.some(cat => cat.id === activeTab)) {
          setActiveTab(visibleCategories[0]?.id || 'common');
        }
      } catch (err) {
        setError('記事の取得に失敗しました。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [userProfile, getVisibleCategories, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const visibleCategories = getVisibleCategories();

  return (
      <Container maxWidth="md">
        <Box my={4}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            ヘルプセンター
          </Typography>
          <Paper elevation={3}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              centered
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': { 
                  minHeight: 64,
                  textTransform: 'none',
                }
              }}
            >
              {visibleCategories.map(category => {
                const Icon = category.icon;
                return (
                  <Tab 
                    key={category.id} 
                    label={category.label}
                    value={category.id} 
                    icon={<Icon />}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" align="center" p={4}>{error}</Typography>
            ) : (
              <List>
                {articles[activeTab]?.map((article) => (
                  <ListItem
                    key={article.id}
                    component={Link}
                    to={`/help/article/${article.id}`}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      transition: '0.3s',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <ChevronRight color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={article.title}
                      primaryTypographyProps={{
                        variant: 'subtitle1',
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
  );
};

export default HelpArticles;