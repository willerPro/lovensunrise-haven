import { PropertyType } from "./property";

export interface PropertyFormData {
  title: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: "rent" | "sale";
  furnishing: "furnished" | "unfurnished";
  type: PropertyType;
}

export interface PropertyFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}