import slugify from "slugify";
import { ClimbTypeToColor } from "./constants";
const path = require(`path`);

/**
 * TODO: I know this is a duplicated function in gatsby-node.js
 * Don't know the best way to share files across the build step and runtime code.
 * This will take a path
 * i.g. USA/Nevada/Southern Nevada/Red Rock/16-Black Velvet Canyon/Black Velvet Wall
 * and split it into all possible paths
 * USA/Nevada/Southern Nevada/Red Rock/16-Black Velvet Canyon/Black Velvet Wall
 * USA/Nevada/Southern Nevada/Red Rock/16-Black Velvet Canyon/
 * USA/Nevada/Southern Nevada/Red Rock/
 * USA/Nevada/Southern Nevada/
 * etc...
 *
 * @param {String} pathId is a POSIX path with / delimiters
 * @returns {Array} returns all the possible paths. The highest root level
 * path will be the first element in the array i.g. ["USA","USA/Nevada",etc...]
 */
export const pathIdToAllPossibleParentPaths = (pathId) => {
  const allPossiblePaths = [];
  const splitPathId = pathId.split("/");
  const totalNumberOfPossiblePaths = splitPathId.length;

  let runningPath = [];
  for (let index = 0; index < totalNumberOfPossiblePaths; index++) {
    let currentPath = splitPathId[index];
    runningPath.push(currentPath);
    allPossiblePaths.push(runningPath.join("/"));
  }

  return allPossiblePaths;
};

/**
 * Given the parentAreas and the all possible parent paths generate a lookup
 * table to map the possible parent paths to the navigation path.
 * These navigation paths will be passed into the navigate function call from
 * gatsby.
 * @param {string} pathId
 * @param {String[]} parentAreas
 * @returns returns an object of the following format
 * {
 *   USA : 'areas/<legacy_id>/USA'
 *   USA : null, // null if there is no possible navigation path
 *   etc...
 *   'USA/Nevada/Southern Nevada/Red Rock/16-Black Velvet Canyon/Black Velvet Wall': 'areas/<legacy_id>/black-velvet-wall'
 * }
 */
export const createNavigatePaths = (pathId, parentAreas) => {
  const allPossibleParentPaths = pathIdToAllPossibleParentPaths(pathId);
  const navigationPaths = {};

  if (!parentAreas || parentAreas.length === 0) {
    return navigationPaths;
  }

  // initialize all the paths with null
  allPossibleParentPaths.forEach((possiblePath) => {
    navigationPaths[possiblePath] = null;
  });

  for (const { node } of parentAreas) {
    const currentPathId = node.fields.pathId;
    const legacy_id = node.frontmatter.metadata.legacy_id;
    const sluggedAreaName = slugify(path.basename(currentPathId), {
      lower: true,
    });
    navigationPaths[currentPathId] = `/areas/${legacy_id}/${sluggedAreaName}`;
  }

  return navigationPaths;
};

/**
 * Given a path or parent id and the type of the page generate the GitHub URL
 * @param {String} pathOrParentId from createNodeField in gatsby-node.js
 * @param {String} fileName the file name of the markdown file without extension
 */
export const pathOrParentIdToGitHubLink = (pathOrParentId, fileName) => {
  const baseUrl =
    "https://github.com/OpenBeta/opentacos-content/blob/develop/content/";
  return baseUrl + pathOrParentId + `/${fileName}.md`;
};

/**
 * Given an array of objects that are climbs, generate the percents
 * and colors of all the types of climbs. This is used in the BarPercent
 * component.
 * @param {Object[]} climbs, these are the nodes {frontmatter, fields} format
 * @returns {percents: [], colors:[]}
 */
export const computeClimbingPercentsAndColors = (climbs) => {
  const typeToCount = {};
  climbs.forEach(({ node: climb }) => {
    const { type } = climb.frontmatter;
    const types = Object.keys(type);
    types.forEach((key) => {
      const isType = type[key];
      if (!isType) return;
      if (typeToCount[key]) {
        typeToCount[key] = typeToCount[key] + 1;
      } else {
        typeToCount[key] = 1;
      }
    });
  });
  const counts = Object.values(typeToCount) || [];
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  const totalClimbs = counts.reduce(reducer, 0);
  const percents = counts.map((count) => {
    return (count / totalClimbs) * 100;
  });
  const colors = Object.keys(typeToCount).map((key) => {
    return ClimbTypeToColor[key];
  });
  return {
    percents,
    colors,
  };
};

/**
 * Given a set of climbs, map them back to their parent areas. For each
 * parent area compute the percents and colors for all of the types of climbs
 * within the area.
 * @param {Object[]} climbs - These are the values within the frontmatter object
 * @returns Object
 */
export const computeStatsBarPercentPerAreaFromClimbs = (climbs) => {
  const areasToClimbs = {};
  const areasToPercentAndColors = {};

  // map each climb to the area
  climbs.edges.map(({ node }) => {
    const parentId = node.fields.parentId;
    if (areasToClimbs[parentId]) {
      areasToClimbs[parentId].push(node.frontmatter);
    } else {
      areasToClimbs[parentId] = [node.frontmatter];
    }
  });

  // compute the stats and percent per area
  // do a little formatting to  reuse the helper function
  Object.keys(areasToClimbs).map((key) => {
    const formatted = areasToClimbs[key].map((c) => {
      return {
        node: {
          frontmatter: c,
        },
      };
    });
    areasToPercentAndColors[key] = computeClimbingPercentsAndColors(formatted);
  });

  return areasToPercentAndColors;
};

/**
 * Simplify climb 'type' dictionary to contain only 'true' key-value pair.
 * @example {sport: true, boulder: false, trad: false} => {sport: true}
 * @param  type Climb type key-value dictionary
 */
export const simplify_climb_type_json = (type) => {
  if (!type) return {};
  for (const key in type) {
    if (type[key] === false) {
      delete type[key];
    }
  }
  return type;
};
