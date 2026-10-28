/**
 * Every category a dish can be in, in the order the menu lists them. A category
 * with no dishes is simply not shown. Its own file because both the schema and
 * the page read it, and the schema must not import page code.
 */
export const dishCategories = ["meat", "vegetable", "soup", "staple", "snack", "dessert"] as const;
