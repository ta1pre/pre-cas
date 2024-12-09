// src/utils/getStatusLabel.js

// ステータスに応じた日本語の表示を返す関数
const getStatusLabel = (status, viewer = 'user') => {
    if (viewer === 'cast') {
      // キャスト向けのステータス表示
      switch (status) {
        case 'pending_user':
          return '調整して下さい';
        case 'pending_cast':
          return 'ユーザーの承認を待っています';
        case 'pending_cast_modification':
          return '予約修正中';
        case 'pending_user_confirmation':
          return 'ユーザー確認待ち';
        case 'pending_user_deposit':  // 追加
          return 'ユーザーのデポジットを待っています';
        case 'confirmed':
          return '予約確定';
        case 'canceled_by_user':
          return 'ユーザーがキャンセルしました';
        case 'canceled_by_cast':
          return 'キャンセル済み';
        case 'canceled_mutual':
          return '双方でキャンセル';
        case 'canceled_by_cast_ng':
          return '対応不可でキャンセルしました';
        default:
          return 'ステータス不明';
      }
    } else {
      // ユーザー向けのステータス表示
      switch (status) {
        case 'pending_user':
          return '予約承認待ち';
        case 'pending_cast':
          return '予約を確定または修正依頼をして下さい';
        case 'pending_cast_modification':
          return 'キャストが予約を修正中';
        case 'pending_user_confirmation':
          return 'キャストの修正内容を確認して下さい';
        case 'pending_user_deposit':  // 追加
          return 'デポジットを行って下さい';
        case 'confirmed':
          return '予約確定';
        case 'canceled_by_user':
          return 'ユーザーによるキャンセル';
        case 'canceled_by_cast':
          return 'キャストによるキャンセル';
        case 'canceled_mutual':
          return '双方合意によるキャンセル';
        case 'canceled_by_cast_ng':
          return 'キャストが対応不可でキャンセル';
        default:
          return 'ステータス不明';
      }
    }
  };
  
  export default getStatusLabel;
  