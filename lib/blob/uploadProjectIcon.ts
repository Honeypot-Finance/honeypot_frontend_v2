import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(image: File, imageName: string) {
  const blob = await put("projectIcons/" + imageName, image, {
    access: "public",
  });

  revalidatePath("/");
  console.log("Image uploaded to", blob);
  return blob;
}
