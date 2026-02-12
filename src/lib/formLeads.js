import { getCleanPhone, isPhoneValid } from "./phoneMask";

const FORM_ENDPOINT_PATH = "/wp-json/beastfpv/v1/forms/submit";

const getDirectEndpoint = () => {
  const raw =
    process.env.NEXT_PUBLIC_FORMS_ENDPOINT ||
    process.env.NEXT_PUBLIC_LEADS_ENDPOINT ||
    "";
  return raw.trim().replace(/\/+$/, "");
};

const getFormsBaseUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_FORMS_WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_LEADS_WORDPRESS_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    "https://beastfpv.ru";
  return raw.trim().replace(/\/+$/, "");
};

export const getLeadFormEndpoint = () => {
  const direct = getDirectEndpoint();
  if (direct) {
    return direct;
  }

  const base = getFormsBaseUrl();
  if (!base) {
    throw new Error("Не задан URL для формы обратной связи");
  }
  return `${base}${FORM_ENDPOINT_PATH}`;
};

export const validateLeadForm = ({ name, phone, agree }) => {
  if (!name || !name.trim()) {
    return "Укажите имя";
  }

  if (!phone || !phone.trim()) {
    return "Укажите телефон";
  }

  if (!isPhoneValid(phone)) {
    return "Введите корректный номер телефона";
  }

  if (!agree) {
    return "Необходимо согласие на обработку персональных данных";
  }

  return null;
};

export const submitLeadForm = async ({
  formType,
  name,
  phone,
  agree,
  honeypot,
  extra = {},
}) => {
  const endpoint = getLeadFormEndpoint();

  const payload = {
    form_type: formType,
    name: (name || "").trim(),
    phone: getCleanPhone(phone || ""),
    consent: Boolean(agree),
    honeypot: honeypot || "",
    website: honeypot || "",
    page_url: typeof window !== "undefined" ? window.location.href : "",
    ...extra,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Ошибка при отправке формы");
  }

  return data;
};
