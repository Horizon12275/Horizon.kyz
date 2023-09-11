## Getting Started

The first step with using Tyra is customizing your metadata in `gatsby-config.js`.

```javascript
siteMetadata: {
  navbarLinks: [
    {to: "/makeup", name: "Makeup"},
    {to: "/lifestyle", name: "Lifestyle"},
    {to: "/blog", name: "blog"},
  ],
  title: "", // The name of your blog
  description: "", // SEO Description
  siteUrl: "", // Base URL of your blog (https://example.com)
  homepageHeader: "", // Header text for the homepage
  homepageAbout: "", // Banner body for the homepage
  mailChimpUrl: "", // Link you your mailchimp campaign (From the embedded form maker)
  mailChimpToken: "", // The hidden field on mailchimp forms
  pinterest: "", // Your pinterest profile
  facebook: "", // Your facebook profile
  twitter: "", // Your twitter profile
}
```
## Adding your Content

Tyra uses markdown for writing blog posts, and follows a simple template for adding new posts. To add a new blog post, create a file in `content/posts/` with the following:

```markdown
---

type: "post"
title: "My Awesome Post Title"
author: "My Name"
category: "My Category"
date: "2019-01-05"
slug: "/my-awesome-post"
postImage: "./img/myimage.jpg"
metaDescription: "This is my first awesome and cool post!!!"

---

You can write your post here using markdown! Link to images in the `img` folder using this syntax:

![Alt Text](./img/my-image.jpeg)
```

Images for posts are stored in `content/posts/img/`. Images in the frontmatter will be used as thumbnails for the articles, as well as in search results.

## License

Tyra is licensed under the terms of the MIT License.