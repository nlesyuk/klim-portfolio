import { z } from "zod";

// Multipart form fields arrive as strings; coerce numbers and parse the
// JSON-encoded fields (photosInfo, categories) at the edge.
const jsonString = <T extends z.ZodTypeAny>(inner: T) =>
  z
    .string()
    .transform((s, ctx) => {
      try {
        return JSON.parse(s) as unknown;
      } catch {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid JSON" });
        return z.NEVER;
      }
    })
    .pipe(inner);

const photoInfoNew = z.object({
  isPreview: z.boolean().optional(),
  order: z.number().nullable().optional(),
  format: z.string().nullable().optional(),
  fileName: z.string().optional(),
});

const photoInfoUpdated = z.object({
  id: z.number(),
  src: z.string(),
  isPreview: z.boolean().optional(),
  order: z.number().nullable().optional(),
  format: z.string().nullable().optional(),
});

const photosInfoSchema = z.object({
  new: z.array(photoInfoNew).optional(),
  updated: z.array(photoInfoUpdated).optional(),
  deleted: z.array(z.number()).optional(),
  existing: z.array(photoInfoUpdated).optional(),
});

// --- auth ---
export const SignupInput = z.object({
  username: z.string().min(1, "username is required"),
  password: z.string().min(1, "password is required"),
});
export const SigninInput = SignupInput;
export const RefreshTokenInput = z.object({
  refreshToken: z.string().min(1, "Refresh Token is required!"),
});
export const LogoutInput = z.object({
  userId: z.coerce.number().int().optional(),
});

// --- contact ---
export const ContactInput = z.object({
  phone: z.string().min(1, "phone is reqiured"),
  email: z.string().min(1, "email is reqiured"),
  theme: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  vimeo: z.string().optional(),
  description: z.string().optional(),
});

// --- work ---
// On create, photosInfo is an array of per-file metadata (one per uploaded
// file). On update, it is an object describing new/updated/deleted photos.
export const CreateWorkInput = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  credits: z.string().optional(),
  videos: z.string().min(1, "videos are required"),
  photosInfo: jsonString(z.array(photoInfoNew)),
  order: z.coerce.number().int(),
});
export const UpdateWorkInput = z.object({
  id: z.coerce.number().int(),
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  credits: z.string().optional(),
  videos: z.string().min(1, "videos are required"),
  photosInfo: jsonString(photosInfoSchema),
  order: z.coerce.number().int(),
});

// --- photo collections ---
export const CreatePhotoCollectionInput = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  credits: z.string().optional(),
  categories: jsonString(z.array(z.string())),
  photosInfo: jsonString(z.array(photoInfoNew)),
  order: z.coerce.number().int(),
});
export const UpdatePhotoCollectionInput = z.object({
  id: z.coerce.number().int(),
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  credits: z.string().optional(),
  categories: jsonString(z.array(z.string())),
  photosInfo: jsonString(photosInfoSchema),
  order: z.coerce.number().int(),
});

// --- shots ---
export const CreateShotInput = z.object({
  shots: jsonString(
    z.array(
      z.object({
        workId: z.coerce.number().int().nullable().optional(),
        format: z.string().nullable().optional(),
        categories: z.array(z.string()).optional(),
      }),
    ),
  ),
});
export const UpdateShotInput = z.object({
  id: z.coerce.number().int(),
  src: z.string().optional(),
  workId: z.coerce.number().int().optional(),
  categories: jsonString(z.array(z.string())),
  format: z.string().optional(),
});

// --- slider ---
export const CreateSlideInput = z.object({
  title: z.string().min(1, "title is required"),
  type: z.enum(["image", "video"], { message: "type is required" }),
  order: z.coerce.number().int(),
  videos: z.string().optional(),
  workId: z.coerce.number().int().optional(),
  photoId: z.coerce.number().int().optional(),
});
export const UpdateSlideInput = CreateSlideInput.extend({
  id: z.coerce.number().int(),
});

export type CreateWorkInput = z.infer<typeof CreateWorkInput>;
export type UpdateWorkInput = z.infer<typeof UpdateWorkInput>;
export type CreatePhotoCollectionInput = z.infer<
  typeof CreatePhotoCollectionInput
>;
export type UpdatePhotoCollectionInput = z.infer<
  typeof UpdatePhotoCollectionInput
>;
export type PhotosInfoParsed = z.infer<typeof photosInfoSchema>;
