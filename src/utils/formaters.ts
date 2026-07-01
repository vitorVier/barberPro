export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(value: number | string | unknown) {
  const numericValue = Number(value);
  if (isNaN(numericValue)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numericValue);
}

export function formatPhone(phone: string | null) {
  if (!phone) return "—";
  
  // Remove tudo que não é dígito
  const cleaned = phone.replace(/\D/g, "");

  // Formato DDI + Celular: +XX (XX) XXXXX-XXXX (13 dígitos)
  if (cleaned.length === 13) {
    // Para retornar estritamente (55) 55 98476-0118, use: "($1) $2 $3-$4"
    return cleaned.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, "+$1 ($2) $3-$4");
  }

  // Formato DDI + Fixo: +XX (XX) XXXX-XXXX (12 dígitos)
  if (cleaned.length === 12) {
    // Para retornar estritamente (55) 55 8476-0118, use: "($1) $2 $3-$4"
    return cleaned.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, "+$1 ($2) $3-$4");
  }

  // Formato Celular: (XX) XXXXX-XXXX (11 dígitos)
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  // Formato Fixo: (XX) XXXX-XXXX (10 dígitos)
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }

  // Se tiver outro tamanho (ex: internacional diferente ou incompleto), retorna o original
  return phone;
}