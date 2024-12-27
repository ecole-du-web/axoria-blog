// server-side component to fetch the post and render the form
import ClientEditForm from "./ClientEditForm";
import { getPost } from "@/lib/server/blog/postMethods";

export default async function Page({ params }) {
  const { id } = params;
  const post = await getPost(id);

  console.log("TZEZZZZZZZZZZZZZZZ",post._id);
  

  return <ClientEditForm post={post} />;
}