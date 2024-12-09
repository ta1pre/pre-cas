// src/components/imageup/ImageCarousel.js

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const ImageCarousel = ({ images }) => {
  return (
    <Swiper
      slidesPerView={1.2}       // 1.2枚表示することで次の画像がちょっと見える
      spaceBetween={10}         // スライド間のスペース
      centeredSlides={true}     // 真ん中にスライドを固定
      loop={true}               // ループ再生を有効化
    >
      {images.sort((a, b) => a.order - b.order).map((image, index) => (
        <SwiperSlide key={index}>
          <img src={image.path} alt={`Cast Image ${index + 1}`} style={{ width: '100%', borderRadius: '8px' }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ImageCarousel;
