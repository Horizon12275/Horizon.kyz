module.exports = {
  siteMetadata: {
    // Site URL for when it goes live, save route prefix
    navbarLinks: [
      { to: "/Articles", name: "Articles" },
      { to: "/Moments", name: "Moments" },
      { to: "/Tech", name: "Tech" },
      { to: "/Mix", name: "Mix" },
      { to: "/blog", name: "blog" },
    ],
    title: "HORIZON",
    description: "Blog website for Horizon version 1.0.1",
    siteUrl: "https://my.horizon4u.red/",
    homepageHeader: "It's Horizon",
    homepageAbout: "Practice makes perfect.",
    mailChimpUrl: "https://github.com/Horizon12275/Horizon.kyz",
    github: "https://github.com/Horizon12275",
    steam: "https://steamcommunity.com/profiles/76561198327411284/",
  },
  plugins: [
    "gatsby-plugin-sitemap",
    "gatsby-plugin-react-helmet",
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-feed",
      options: {
        query: `
        {
          site {
            siteMetadata {
              title
              description
              siteUrl
              site_url: siteUrl
            }
          }
        }
      `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: edge.node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + edge.node.frontmatter.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.frontmatter.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                });
              });
            },
            query: `
            {
              allMarkdownRemark(
                limit: 1000,
                sort: { order: DESC, fields: [frontmatter___date] },
                filter: {frontmatter: {type: {eq: "post"}}}
              ) {
                edges {
                  node {
                    excerpt
                    html
                    frontmatter {
                      slug
                      title
                      date
                    }
                  }
                }
              }
            }
          `,
            output: "/rss.xml",
            title: "Gatsby RSS Feed",
          },
        ],
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content`,
        name: "content",
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          "gatsby-remark-copy-linked-files",
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 1400,
            },
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-web-font-loader",
      options: {
        google: {
          families: ["Karla", "Playfair Display", "Lora"],
        },
      },
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "Horizon.kyz",
        head: false,
        anonymize: true,
        respectDNT: true,
        exclude: ["/success"],
        cookieDomain: "https://my.horizon4u.red/",
      },
    },
    // 你的 gatsby-config.js
    {
      resolve: `gatsby-plugin-waline`,
      options: {
        // 插件配置
        serverURL: "https://www.ez4horizon.top/",
      },
    },
  ],
};
