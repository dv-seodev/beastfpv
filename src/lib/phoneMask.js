export const formatPhoneNumber = (value) => {
    // Удаляем все нецифровые символы
    const digits = value.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    let formattedDigits = digits.replace(/^8/, '7');

    // Если нет кода страны, добавляем 7
    if (!formattedDigits.startsWith('7')) {
        formattedDigits = '7' + formattedDigits;
    }

    // Берём только первые 11 цифр (7 + 10 цифр номера)
    formattedDigits = formattedDigits.slice(0, 11);

    // Применяем маску: +7 (999) 999-99-99
    if (formattedDigits.length === 0) return '';
    if (formattedDigits.length <= 1) return '+' + formattedDigits;
    if (formattedDigits.length <= 4) return '+' + formattedDigits.slice(0, 1) + ' (' + formattedDigits.slice(1);
    if (formattedDigits.length <= 7) return '+' + formattedDigits.slice(0, 1) + ' (' + formattedDigits.slice(1, 4) + ') ' + formattedDigits.slice(4);
    if (formattedDigits.length <= 9) return '+' + formattedDigits.slice(0, 1) + ' (' + formattedDigits.slice(1, 4) + ') ' + formattedDigits.slice(4, 7) + '-' + formattedDigits.slice(7);

    return '+' + formattedDigits.slice(0, 1) + ' (' + formattedDigits.slice(1, 4) + ') ' + formattedDigits.slice(4, 7) + '-' + formattedDigits.slice(7, 9) + '-' + formattedDigits.slice(9, 11);
};

/**
 * Проверяет, валиден ли номер телефона
 */
export const isPhoneValid = (phone) => {
    const digits = phone.replace(/\D/g, '');
    // Должно быть минимум 11 цифр (7 + 10 цифр номера)
    return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'));
};

/**
 * Получает чистый номер без форматирования
 */
export const getCleanPhone = (phone) => {
    return phone.replace(/\D/g, '');
};