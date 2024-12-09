// src/routes/routes.js
// 追加するときはimportとルートとどちらも追加する

import Home from '../pages/Home';
import Login from '../components/auth/Login';
import MyPage from '../pages/MyPage/Dashboard';
import Account from '../pages/MyPage/account';
import About from '../pages/static/About';
import sandbox from '../pages/static/sandbox';
import CastProfile from '../pages/cast/CastProfile';
import CastProfileView from '../pages/cast/CastProfileView'; // 新しく追加
import HelpArticles from '../pages/static/HelpArticles';
import HelpArticle from '../pages/static/HelpArticle';
import EditCastSchedule from '../pages/cast/EditCastSchedule';
import Reservation from '../pages/resv/Reservation.js';
import ReservationList from '../pages/resv/ReservationList.js';
import ReservationDetail from '../pages/resv/ReservationDetail.js';
import ReservationUserList from '../pages/resv/ReservationUserList.js';
import ReservationUserDetail from '../pages/resv/ReservationUserDetail.js';
import Blog from '../pages/blog/Blog'; 
import CastPosts from '../pages/blog/CastPosts';

import { ROLES } from '../utils/roles';

export const routes = [
  { path: '/', element: Home },
  { path: '/home', element: Home },
  { path: '/login', element: Login },
  { path: '/mypage', element: MyPage, protected: true },
  { path: '/about', element: About },
  { path: '/sandbox', element: sandbox },
  { path: '/mypage/account', element: Account, protected: true },
  { path: '/cast/:cast_id/profile', element: CastProfileView }, // 新しい閲覧専用ページ
  { path: '/cast/:cast_id/edit', element: CastProfile, protected: true }, // 編集専用ページ（既存ルート調整）
  { path: '/help', element: HelpArticles },
  { path: '/help/article/:articleId', element: HelpArticle },
  { path: '/cast/:cast_id/edit-schedule', element: EditCastSchedule, protected: true },
  { path: '/reservation/:cast_id', element: Reservation },
  { path: '/resvlist', element: ReservationList },
  { path: '/resv/detail/:resv_id', element: ReservationDetail },
  { path: '/resvuserlist', element: ReservationUserList },
  { path: '/resv/userdetail/:resv_id', element: ReservationUserDetail },
  { path: '/cast/:castId/posts', element: CastPosts }, 
  { path: '/blog', element: Blog },

  // 他のルートをここに追加
];
