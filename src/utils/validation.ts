export function isValidEmail(email: string): boolean {
  return /.+@.+/.test(email);
}
export function validateProductFields(
  name: string,
  description: string,
  price: string,
  previousPrice: string,
  image: Express.Multer.File | undefined
) {
  if (!name || !price || !description || !image || !previousPrice) {
    if (!name) {
      return { message: "Item name is required" };
    } else if (!price) {
      return { message: "Price is required" };
    } else if (!description) {
      return { message: "Item description is required" };
    } else if (!image) {
      return { message: "Image is required" };
    } else if (!previousPrice) {
      return { message: "Item previousType is required" };
    } else {
      return { message: "Please enter all required fields" };
    }
  }
  return null;
}
