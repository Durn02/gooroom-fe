import DefaultButton from "@/components/Button/DefaultButton";
import Link from "next/link";

export default function NoPage() {
  return (
    <div>
      <h1>404 not found</h1>
      <Link href={"/"}>
        <DefaultButton placeholder="go to landing page" />
      </Link>
    </div>
  );
}
