import React from "react";
import DefaultButton from "../../components/Button/DefaultButton";
import { Link } from "react-router-dom";

export default function NoPage() {
  return (
    <div>
      <h1>404 not found</h1>
      <Link to={"/"}>
        <DefaultButton placeholder="go to main page" />
      </Link>
    </div>
  );
}
