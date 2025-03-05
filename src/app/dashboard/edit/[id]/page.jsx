// server-side component to fetch the post and render the form
//
import { serializeMongoData } from "@/lib/utils/general/utils";
import ClientEditForm from "./ClientEditForm";
import { getPostForEdit } from "@/lib/server/blog/postMethods";

export default async function Page({ params }) {
  const { id } = await params;
  const post = await getPostForEdit(id);
  const serializablePost = serializeMongoData(post);

  return <ClientEditForm post={serializablePost} />;
}