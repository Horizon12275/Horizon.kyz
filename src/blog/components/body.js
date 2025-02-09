import React from "react";
import Suggested from "./suggested.js";
import "tachyons";
import "../../common/styles/custom.tachyons.css";
import "../styles/grid.css";

export default (props) => (
  <div className="min-vh-100 blog__grid">
    <div style={{ gridArea: "header" }} />
    <div
      className="mw8 serif f4 lh-copy center pa2 article__container"
      style={{ gridArea: "content" }}
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
    <Suggested />
  </div>
);
