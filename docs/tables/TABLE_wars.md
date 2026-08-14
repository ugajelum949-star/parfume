---
aliases: [wars, war, product-drop, flash-launch]
tags: [database]
---

# Table: wars

Product drop / war events.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| name | text | War name (e.g. "War Mykonos") |
| description | text | Optional description |
| image | text | Banner image URL |
| startTime | timestamp | When war begins |
| endTime | timestamp | When war ends |
| active | boolean | Is war active |
| converted | boolean | Has been converted to products |
| createdAt | timestamp | Created at |
| updatedAt | timestamp | Updated at |

## Relations

```
wars 1───∞ war_items
```

## Related

- [[FLOW_wars]] — War pricing lifecycle & auto-conversion
- [[TABLE_war_items]] — Individual products in a war

*See also: [[DATABASE_SCHEMA]], [[PROJECT_OVERVIEW]]*
