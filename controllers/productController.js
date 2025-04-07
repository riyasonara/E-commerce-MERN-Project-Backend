import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/product.js";
import mongoose from "mongoose";

// add product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      quantity,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      price: Number(price),
      category,
      quantity: Number(quantity),
      subCategory,
      sizes: JSON.parse(sizes),
      bestseller: bestseller === "true" ? true : false,
      image: imagesUrl,
      date: Date.now(),
    };
    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product saved successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// update product
export const updateProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { name, description, price, category, subCategory, sizes, bestseller, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Fetch the existing product
    const existingProduct = await productModel.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedImages = existingProduct.image; // Default to existing images

    // If new images are uploaded, delete old ones and upload new ones
    if (req.files) {
      // Delete old images from Cloudinary
      if (existingProduct.image && existingProduct.image.length > 0) {
        await Promise.all(
          existingProduct.image.map(async (imageUrl) => {
            const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract publicId from Cloudinary URL
            await cloudinary.uploader.destroy(publicId);
          })
        );
      }

      // Upload new images
      const uploadedImages = await Promise.all(
        Object.values(req.files).map(async (fileArray) => {
          const file = fileArray[0]; // Extract file
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );

      updatedImages = uploadedImages; // Replace with new images
    }

    // Update product
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        image: updatedImages,
        quantity,
        category,
        subCategory,
        sizes,
        bestseller,
      },
      { new: true }
    );
    await updatedProduct.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// delete product
export const deleteProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// list all products
export const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// get product by id
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).send("Product not found");
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};