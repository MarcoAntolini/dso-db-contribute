/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as mutations_images from "../mutations/images.js";
import type * as mutations_items from "../mutations/items.js";
import type * as mutations_sets from "../mutations/sets.js";
import type * as mutations_usernames from "../mutations/usernames.js";
import type * as queries_images from "../queries/images.js";
import type * as queries_items from "../queries/items.js";
import type * as queries_sets from "../queries/sets.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "mutations/images": typeof mutations_images;
  "mutations/items": typeof mutations_items;
  "mutations/sets": typeof mutations_sets;
  "mutations/usernames": typeof mutations_usernames;
  "queries/images": typeof queries_images;
  "queries/items": typeof queries_items;
  "queries/sets": typeof queries_sets;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
