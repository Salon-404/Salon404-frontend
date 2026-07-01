import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/global/Navbar";
import { getSalons } from "../../services/salonService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function  SalonCarousel({ salon }) {
  const imagenes = useMemo(() => {
    const imgs = [];

    if (salon.profilePicture) {
      imgs.push({
        url: salon.profilePicture,
        titulo: "Portada",
      });
    }

    if (Array.isArray(salon.photos)) {
      salon.photos.forEach((photo, index) => {
        imgs.push({
          url: photo.url ?? photo,
          titulo: `Foto ${index + 1}`,
        });
      });
    }

    if (salon.salonDiagram) {
      imgs.push({
        url: salon.salonDiagram,
        titulo: "Plano del salón",
      });
    }

    return imgs;
  }, [salon]);

  if (imagenes.length === 0) {
    return (
      <div className="flex h-[450px] items-center justify-center bg-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-bold text-indigo-600 shadow">
            404
          </div>

          <h3 className="text-xl font-semibold">
            Sin imágenes
          </h3>

          <p className="mt-2 text-slate-500">
            Este salón todavía no posee fotografías.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{
        delay: 4500,
        disableOnInteraction: false,
      }}
      loop={imagenes.length > 1}
      className="h-[480px]"
    >
      {imagenes.map((img, index) => (
        <SwiperSlide key={index}>
          <div className="relative h-[480px]">
            <img
              src={img.url}
              alt={img.titulo}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            <div className="absolute bottom-6 left-6 rounded-full bg-white/90 px-5 py-2 font-semibold shadow">
              {img.titulo}
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}