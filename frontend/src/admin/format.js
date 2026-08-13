// Consistent ₹ formatting across the admin dashboard (2 decimals, en-IN
// thousands grouping) so amounts never render as "₹500" next to "₹1250.5".
export function formatINR(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
