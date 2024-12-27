import mongoose from "mongoose";
import slugify from "slugify";
import { User } from "./user";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true
    },
    markdownHTMLResult: {
      type: String,
      required: true,
    },
    markdownArticle: { 
      type: String, 
      required: true 
    },
    coverImageUrl: {
      type: String,  // URL de l'image originale
      required: true,  // Vous pouvez le rendre facultatif selon vos besoins
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,  // Référence aux ObjectId des tags
      ref: 'Tag'                             // Référence au modèle Tag
    }],
    slug: {
      type: String,
      unique: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,  // Référence à l'utilisateur
      ref: "User",  // Le modèle auquel l'ID fait référence
      required: true,
    },
  },
  { timestamps: true }
);

// Slug à changer quand on modifie un article ?
postSchema.pre("save", async function (next) {
  if (!this.slug) {
    let slugCandidate = slugify(this.title, { lower: true, strict: true });
    console.log("Initial slug candidate:", slugCandidate);

    let slugExists = await mongoose.models.Post.findOne({ slug: slugCandidate });

    let counter = 1;
    while (slugExists) {
      slugCandidate = `${slugCandidate}-${counter}`;
      slugExists = await mongoose.models.Post.findOne({ slug: slugCandidate });
      counter++;
    }

    this.slug = slugCandidate;
    console.log("Final slug generated:", this.slug);
  }
  next();
});

export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);