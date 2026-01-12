'use client'
import { useState, useEffect, useRef } from "react";

const CdekMap = ({ onPVZselect }) => {

    let mapCdek;

    useEffect(() => {
        if (mapCdek) return;

        mapCdek = new window.CDEKWidget({
            from: 'Москва',
            root: 'cdek-map',
            apiKey: 'c390b32a-a818-4842-b71f-262d4ff04489',
            canChoose: true,
            defaultLocation: [55.753544, 37.621202],
            lang: 'rus',
            currency: 'RUB',
            servicePath: 'https://test.beastfpv.ru/wp-json/cdek/v1/webhook',
            hideDeliveryOptions: { office: false, door: true },
            onReady() {
                console.log('✅ CDEK загружен');

            },
            onError(error) {
                console.error('❌ Ошибка CDEK:', error);
            },
            onCalculate() {
                console.log('Расчет стоимости доставки произведен');
            },
            onChoose(delivery, rate, address) {
                console.log('Доставка выбрана', delivery, address.code);
                onPVZselect(address);
            },
        });

    }, []);

    return (
        <div className="cdek-map-wrapper">
            <div
                id="cdek-map"
                style={{
                    height: '600px',
                    marginTop: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: '#f5f5f5'
                }}
            >
            </div>
        </div>
    );
}

export default CdekMap;