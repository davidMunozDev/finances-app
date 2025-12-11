export const PERIODS = [
  { value: "weekly", label: "Semanal", subtitle: "Cada semana" },
  { value: "monthly", label: "Mensual", subtitle: "Cada mes" },
  { value: "yearly", label: "Anual", subtitle: "Cada año" },
];

export const DAYS_OF_WEEK = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "7", label: "Domingo" },
];

export const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: String(i + 1),
  label: `Día ${i + 1}`,
}));
