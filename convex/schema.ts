import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { Classes, Rarities, Slots } from "dso-database";

export const setSchema = {
	class: v.union(
		v.literal(Classes.dragonknight),
		v.literal(Classes.ranger),
		v.literal(Classes.spellweaver),
		v.literal(Classes.steamMechanicus)
	),
	name: v.string(),
	items: v.array(v.string()),
	setBonus: v.array(
		v.object({
			requiredItems: v.number(),
			bonus: v.union(
				v.object({
					stat: v.string(),
					value: v.union(v.number(), v.string())
				}),
				v.string()
			)
		})
	),
	approved: v.optional(v.boolean()),
	contributorUsername: v.optional(v.string())
};

export const itemSchema = {
	name: v.string(),
	class: v.union(
		v.literal(Classes.dragonknight),
		v.literal(Classes.ranger),
		v.literal(Classes.spellweaver),
		v.literal(Classes.steamMechanicus)
	),
	image: v.string(),
	rarity: v.union(v.literal(Rarities.setItem), v.literal(Rarities.uniqueItem), v.literal(Rarities.mythicItem)),
	slot: v.union(
		v.literal(Slots.ammo),
		v.literal(Slots.amulet),
		v.literal(Slots.armor),
		v.literal(Slots.axe),
		v.literal(Slots.banner),
		v.literal(Slots.battleShield),
		v.literal(Slots.belt),
		v.literal(Slots.book),
		v.literal(Slots.boots),
		v.literal(Slots.cloak),
		v.literal(Slots.focusCrystal),
		v.literal(Slots.gloves),
		v.literal(Slots.gun),
		v.literal(Slots.heavyGun),
		v.literal(Slots.helmet),
		v.literal(Slots.longAxe),
		v.literal(Slots.longMace),
		v.literal(Slots.longStaff),
		v.literal(Slots.longSword),
		v.literal(Slots.longbow),
		v.literal(Slots.mace),
		v.literal(Slots.orb),
		v.literal(Slots.pauldrons),
		v.literal(Slots.quiver),
		v.literal(Slots.ring),
		v.literal(Slots.shield),
		v.literal(Slots.shortbow),
		v.literal(Slots.siegeBow),
		v.literal(Slots.staff),
		v.literal(Slots.sword),
		v.literal(Slots.tool),
		v.literal(Slots.trophy)
	),
	level: v.number(),
	stats: v.array(
		v.object({
			stat: v.string(),
			minValue: v.number(),
			maxValue: v.number()
		})
	),
	set: v.optional(v.object(setSchema)),
	uniqueBonus: v.optional(
		v.array(
			v.object({
				bonus: v.union(
					v.object({
						stat: v.string(),
						value: v.union(v.number(), v.string())
					}),
					v.string()
				)
			})
		)
	),
	approved: v.optional(v.boolean()),
	contributorUsername: v.optional(v.string())
};

const imageSchema = {
	imageName: v.string(),
	isMissing: v.boolean()
};

const usernameSchema = {
	username: v.string(),
	ipAddress: v.string(),
	timestamp: v.string()
};

export default defineSchema({
	items: defineTable(itemSchema),
	sets: defineTable(setSchema),
	dwarfImages: defineTable(imageSchema),
	mageImages: defineTable(imageSchema),
	warriorImages: defineTable(imageSchema),
	rangerImages: defineTable(imageSchema),
	usernames: defineTable(usernameSchema)
});
