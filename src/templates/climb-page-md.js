import React from "react";
import { graphql, navigate } from "gatsby";
import Layout from "../components/layout";
import SEO from "../components/seo";
import { MDXProvider } from "@mdx-js/react";
import { MDXRenderer } from "gatsby-plugin-mdx";
import BreadCrumbs from "../components/ui/BreadCrumbs";
import { pathOrParentIdToGitHubLink } from "../js/utils";
import LinkToGithub from "../components/ui/LinkToGithub";
import { h1, h2, p } from "../components/ui/shortcodes";
import { template_h1_css } from "../js/styles";
import RouteGradeChip from "../components/ui/RouteGradeChip";
import RouteTypeChips from "../components/ui/RouteTypeChips";

const shortcodes = {
  h1,
  h2,
  p,
}; // Provide common components here

/**
 * Templage for generating individual page for the climb
 */
export default function ClimbPage({ data: { mdx } }) {
  const { route_name, yds, type, safety } = mdx.frontmatter;
  const { parentId, filename, pathTokens } = mdx.fields;
  const githubLink = pathOrParentIdToGitHubLink(parentId, filename);
  return (
    <Layout>
      {/* eslint-disable react/jsx-pascal-case */}
      <SEO keywords={[route_name]} title={route_name} />
      <BreadCrumbs pathTokens={pathTokens} isClimbPage={true} />
      <h1 className={template_h1_css}>{route_name}</h1>
      <div className="float-right">
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/edit?file=${parentId}/${filename}.md`)}
        >
          Edit
        </button>
      </div>
      <RouteGradeChip yds={yds} safety={safety}></RouteGradeChip>
      <RouteTypeChips type={type}></RouteTypeChips>
      <MDXProvider components={shortcodes}>
        <MDXRenderer frontmatter={mdx.frontmatter}>{mdx.body}</MDXRenderer>
      </MDXProvider>
      <LinkToGithub link={githubLink} docType="climb"></LinkToGithub>
    </Layout>
  );
}

export const query = graphql`
  query ($legacy_id: String!) {
    mdx: mdx(
      fields: { collection: { eq: "climbing-routes" } }
      frontmatter: { metadata: { legacy_id: { eq: $legacy_id } } }
    ) {
      id
      fields {
        parentId
        filename
        pathTokens
      }
      frontmatter {
        route_name
        metadata {
          legacy_id
        }
        yds
        safety
        type {
          tr
          trad
          sport
          boulder
        }
      }
      body
    }
  }
`;
