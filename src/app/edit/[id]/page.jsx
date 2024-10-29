// server-side component to fetch the post and render the form
import { getPost } from "@/lib/actions/dataActions";
import ClientEditForm from "./ClientEditForm";

export default async function Page({ params }) {
  const { id } = params;
  const post = await getPost(id);

  console.log("TZEZZZZZZZZZZZZZZZ",post._id);
  

  return <ClientEditForm post={post} />;
}