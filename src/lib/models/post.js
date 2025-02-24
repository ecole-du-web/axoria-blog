import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      // unique: true
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

// middleware qui s'execute lors d'un document créé à partir d'un modèle, avant la sauvegarde
postSchema.pre("save", async function (next) {
  if (!this.slug) {
    let slugCandidate = slugify(this.title, { lower: true, strict: true });

    let slugExists = await mongoose.models.Post.findOne({ slug: slugCandidate });

    let counter = 1;
    while (slugExists) {
      slugCandidate = `${slugCandidate}-${counter}`;
      slugExists = await mongoose.models.Post.findOne({ slug: slugCandidate });
      counter++;
    }

    this.slug = slugCandidate;
  }
  next();
});

// Crée une instance du modèle Post à partir du schéma postSchema.
// Si le modèle existe déjà (dans le cache de Mongoose, via mongoose.models), il le réutilise.
export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);