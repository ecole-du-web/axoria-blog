import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    // img: {
    //   type: String,
    // },
    // userId: {
    //   type: String,
    //   required: true,
    // },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

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