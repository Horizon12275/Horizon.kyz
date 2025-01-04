import React from "react";
import { Link } from "gatsby";
import Img from "gatsby-image";
import "tachyons";

export default (props) => (
  <div className="pv3 flex justify-center items-center flex-wrap">
    <Link to={props.slug} className="w-100 mw6 h-100">
      <Img className="w-100 h-auto" fluid={props.fluidImage} alt="" />
    </Link>
    <div className="mw7 pa2 ph4-ns">
      <span className="db f2 display">
        <Link className="dark-gray no-underline" to={props.slug}>
          {props.title}
        </Link>
      </span>
      <div className="mv3 mb5-ns flex justify-between">
        <div className="db f6 silver ttu tracked sans-serif">{props.date}</div>
        <div className="db f6 silver ttu tracked sans-serif">
          TAGGED: {props.category}
        </div>
      </div>
      <div className="serif f4 lh-copy">{props.description}</div>
    </div>
  </div>
);
