import React from 'react';
import {
  FaPinterestP,
  FaGithub,
  FaSteam,
  FaCamera,
  FaTwitch
} from 'react-icons/fa';
import {FiMail} from 'react-icons/fi'
import { StaticQuery, graphql } from 'gatsby';
import 'tachyons';


export default (props) => {
  let { desc, img, location } = props;
  location = encodeURIComponent(location.pathname);
  desc = encodeURIComponent(desc);
  img = encodeURIComponent(img);
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              siteUrl
            }
          }
        }  
      `}
      render={data => {
        const base = encodeURIComponent(data.site.siteMetadata.siteUrl);
        return (
        <div className="dn db-l" style={{gridArea: "sidebar"}}>
          <div className="w3 bg-dark-gray flex flex-wrap" style={{position: "sticky", top: "4rem"}}>
            <a
                href={`https://steamcommunity.com/profiles/76561198327411284/`}
              className="w-100 h3 flex items-center justify-center b near-white"><FaSteam /></a>
            <a
                href={`https://github.com/Horizon4U`}
              className="w-100 h3 flex items-center justify-center b near-white"><FaGithub /></a>
            <a
                href={`http://www.cac.gov.cn/gzzt/ztzl/zt/esd/A0920010911index_1.htm`}
              className="w-100 h3 flex items-center justify-center b near-white"><FaTwitch /></a>
          </div>
        </div>
    )}} />
  )
}
