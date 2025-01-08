import z from "zod";
// Profile
const FirstName = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(20, "Name must be less than 20 characters");
const LastName = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(20, "Name must be less than 20 characters");
const PhoneNumber = z.string().regex(/^\+?\d{10,15}$/, "Invalid phone number");
const Address = z
  .string()
  .min(2, "Address must be at least 2 characters")
  .max(50, "Address must be less than 50 characters");
const City = z
  .string()
  .min(2, "City must be at least 2 characters")
  .max(20, "City must be less than 20 characters");
const Country = z
  .string()
  .min(2, "Country must be at least 2 characters")
  .max(20, "Country must be less than 20 characters");
// User
const Name = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(20, "Name must be less than 20 characters");
const Email = z.string().email("Invalid email format");
const Password = z.string().min(8, "Password must be at least 8 characters");
const Role = z.enum(["admin", "customer", "staff", "supplier"], {
  errorMap: () => {
    return { message: "Invalid role" };
  },
});
const IsActive = z.boolean();

export const signUpSchema = z.object({
  name: Name,
  email: Email,
  password: Password,
});

export type signUpT = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z.string().nonempty("Email is required").email("Invalid email format"),
  password: z.string().nonempty("Password is required"),
});

export type loginT = z.infer<typeof loginSchema>;

export const UserScehma = z.object({
  name: Name,
  email: Email,
  password: Password,
  role: Role.optional().default("customer"),
  isActive: IsActive.optional().default(true),
});

export type UserT = z.infer<typeof UserScehma>;

export const profileSchema = z.object({
  first_name: FirstName,
  last_name: LastName,
  phone_number: PhoneNumber,
  address: Address,
  city: City,
  country: Country,
});

export type ProfileT = z.infer<typeof profileSchema>;

export const UserWithProfile = UserScehma.merge(profileSchema);

export type UserWithProfileT = z.infer<typeof UserWithProfile>;

export const changePasswordSchema = z.object({
  password: Password,
  new_password: Password,
});

export type ChangePasswordT = z.infer<typeof changePasswordSchema>;
