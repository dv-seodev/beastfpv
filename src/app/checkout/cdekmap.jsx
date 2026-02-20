"use client";
import { useState, useEffect, useRef } from "react";

const CdekMap = ({ onPVZselect }) => {
  let mapCdek;

  useEffect(() => {
    if (mapCdek) return;

    mapCdek = new window.CDEKWidget({
      from: "Новосибирск",
      defaultLocation: [82.9346, 55.0415],
      lang: "rus",
      currency: "RUB",
      root: "cdek-map",
      apiKey: "bf092e70-98de-4d12-b3bb-7ed56f9a855e",
      canChoose: true,
      servicePath: "https://api.beastfpv.ru/wp-json/cdek/v1/webhook",
      hideDeliveryOptions: { office: false, door: true },
      onReady() {
        console.log("✅ CDEK загружен");
      },
      onError(error) {
        console.error("❌ Ошибка CDEK:", error);
      },
      onCalculate() {
        console.log("Расчет стоимости доставки произведен");
      },
      onChoose(delivery, rate, address) {
        console.log("Доставка выбрана", delivery, address.code);
        onPVZselect(address);
      },
    });
  }, []);

  return (
    <div className="cdek-map-wrapper">
      <div
        id="cdek-map"
        style={{
          height: "600px",
          marginTop: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
        }}
      ></div>
    </div>
  );
};

export default CdekMap;
