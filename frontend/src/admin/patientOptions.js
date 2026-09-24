// Dropdown options for the Patient Details form. Kept in sync with the
// allowed-value sets in backend/patients.py, which rejects anything else.
export const DELIVERY_TYPES = [
  "Normal (Vaginal)",
  "C-Section (Planned)",
  "C-Section (Emergency)",
  "Assisted - Vacuum",
  "Assisted - Forceps",
  "VBAC (Normal after C-Section)",
];

export const BABY_GENDERS = ["Boy", "Girl", "Ambiguous"];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// A newborn's blood group isn't always tested at birth.
export const BABY_BLOOD_GROUPS = [...BLOOD_GROUPS, "Not tested"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];
