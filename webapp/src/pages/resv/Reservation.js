// /src/components/resv/Reservation.js
import React, { useState, useContext } from 'react'; // React、useState、useContextをインポート
import { useParams } from 'react-router-dom'; // URLパラメータ取得用
import { Stepper, Step, StepLabel, Box, Button, Container, Typography } from '@mui/material'; // Material UIコンポーネントをインポート
import DateStep from '../../components/resv/DateStep'; // 日付選択ステップコンポーネント
import CourseStep from '../../components/resv/CourseStep'; // コース選択ステップコンポーネント
import OptionStep from '../../components/resv/OptionStep'; // オプション選択ステップコンポーネント
import LocationStep from '../../components/resv/LocationStep'; // 場所選択ステップコンポーネント
import ConfirmationStep from '../../components/resv/ConfirmationStep'; // 確認ステップコンポーネント
import CastInfo from '../../components/cast/CastInfo'; // キャスト情報コンポーネント
import axios from 'axios'; // APIリクエスト用のaxiosをインポート
import { AuthContext } from '../../context/AuthContext'; // 認証コンテキストをインポート

// ステップ名を配列で定義
const steps = ['日時', 'コース', 'OPT', '場所', '送信'];

const Reservation = () => {
  const { cast_id } = useParams(); // URLからキャストIDを取得
  const { loggedIn, userProfile } = useContext(AuthContext); // 認証情報を取得

  const [step, setStep] = useState(0); // 現在のステップを管理
  const [reservationData, setReservationData] = useState({
    date: null,
    time: null,
    course: null,
    courseType: null,
    selectedTime: null,
    options: [],  // オプション情報を配列で管理
    location: '',
    castId: cast_id  // URLから取得したキャストIDを設定
  });

  // 予約データを更新する関数
  const updateReservationData = (data = {}) => {
    console.log("更新前のreservationData:", reservationData); // 更新前のデータを表示
    console.log("更新するデータ:", data); // 更新するデータを表示

    // コースが変更された場合、オプションをリセット
    if (data.course && data.course !== reservationData.course) {
      data.options = []; // 新しいコースに合わせてオプションをリセット
    }

    setReservationData((prevData) => {
      const updatedData = { ...prevData, ...data };
      console.log("更新後のreservationData:", updatedData); // 更新後のデータを表示
      return updatedData;
    });
  };

  // 次のステップに進む関数
  const handleNextStep = () => {
    console.log("次のステップに進むときのreservationData:", reservationData);

    // オプション情報を確認のため表示
    const optionsText = reservationData.options.length > 0
      ? reservationData.options.map(option => `\nオプション名: ${option.name}（価格: ¥${option.price}）`).join('')
      : '未選択';

    // 現在の予約内容をアラートで表示
    alert(`現在のデータ: \n日付: ${reservationData.date}\n時間: ${reservationData.time}\n選択されたコース時間: ${reservationData.selectedTime}\nコース: ${reservationData.course}\n場所: ${reservationData.location}${optionsText}`);
    setStep((prevStep) => prevStep + 1);
  };

  // 前のステップに戻る関数
  const handlePreviousStep = () => {
    if (step > 0) {
      const optionsText = reservationData.options.length > 0
        ? reservationData.options.map(option => `\nオプション名: ${option.name}（価格: ¥${option.price}）`).join('')
        : '未選択';

      // 戻る前のデータをアラートで表示
      alert(`戻る前のデータ: \nコース: ${reservationData.course}\n選択されたコース時間: ${reservationData.selectedTime}\n場所: ${reservationData.location}${optionsText}`);
      setStep((prevStep) => prevStep - 1);
    }
  };

  // 予約を送信する関数
  const handleSubmit = async () => {
    if (!loggedIn || !userProfile) {
        alert("ログイン情報が取得できていません。再度ログインしてください。");
        return;
    }
  
    try {
        // 指名料 + コースのキャスト報酬ポイント + オプション + 交通費を合計
        const totalCastRewardPoints = 
            (reservationData.selectionFee || 0) +  // 指名料
            (reservationData.castRewardPoints || 0) +  // コースのキャスト報酬ポイント
            (reservationData.options.reduce((sum, option) => sum + (option.price || 0), 0)) +  // オプション
            (reservationData.fare || 0);  // 交通費
  
        const requestData = {
            user_id: userProfile.userInvitationId,
            cast_id: cast_id,
            course_id: 1, // 必要に応じて設定
            date: `${reservationData.date}T${reservationData.time}:00`,
            selected_time: reservationData.selectedTime,
            location: reservationData.location,
            total_points: reservationData.coursePoints + (reservationData.selectionFee || 0) + 
                reservationData.options.reduce((sum, option) => sum + (option.price || 0), 0),
            fare: reservationData.fare || 0,
            shimei: reservationData.selectionFee || 0,  // 指名料
            cast_reward_points: totalCastRewardPoints,  // 計算した合計を送信
            status: "pending_user",
            progress_status: "pending",
            options: reservationData.options.map(option => ({
                option_id: option.id,  // option_idとして送信
                option_price: option.price  // option_priceとして送信
            }))
        };
  
        console.log("送信するリクエストデータ:", JSON.stringify(requestData, null, 2));
  
        // APIリクエストの送信
        const response = await axios.post('https://5611-122-217-34-64.ngrok-free.app/api/resv/reservations/', requestData);
        if (response.status === 201) {
            alert('予約が正常に作成されました！');
            setStep(0);
            setReservationData({
                date: null,
                time: null,
                course: null,
                courseType: null,
                selectedTime: null,
                options: [],
                location: '',
                castId: cast_id
            });
        }
    } catch (error) {
        console.error('予約作成中のエラー:', error.response ? error.response.data : error.message);
        alert('予約作成に失敗しました。');
    }
  };
  


  return (
    <Container maxWidth="sm" sx={{ padding: 2 }}>
      <CastInfo castId={cast_id} onCastInfoRetrieved={(castInfo) => {
        updateReservationData({
          castName: castInfo.name,  // キャスト名を保存
          selectionFee: castInfo.selection_fee // 指名料を保存
        });
      }}/>

      <Stepper activeStep={step} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ marginTop: 4 }}>
        {step === 0 && (
          <DateStep onNext={(data) => { updateReservationData(data); handleNextStep(); }}
            initialDate={reservationData.date} initialTime={reservationData.time} />
        )}
        {step === 1 && (
          <CourseStep onNext={handleNextStep} onPrevious={handlePreviousStep}
            updateData={updateReservationData} initialCourse={reservationData.course}
            initialTime={reservationData.selectedTime} />
        )}
        {step === 2 && (
          <OptionStep onNext={(data) => {
            updateReservationData({ options: data.options });
            handleNextStep();
          }}
          onPrevious={handlePreviousStep} selectedCourse={reservationData.course}
          initialOption={reservationData.options} castId={reservationData.castId} />
        )}
        {step === 3 && (
          <LocationStep onNext={(data) => { updateReservationData(data); handleNextStep(); }}
            onPrevious={handlePreviousStep} initialLocation={reservationData.location} />
        )}
        {step === 4 && (
          <ConfirmationStep reservationData={reservationData}
            onPrevious={handlePreviousStep} onSubmit={handleSubmit} />
        )}
      </Box>
    </Container>
  );
};

export default Reservation;
