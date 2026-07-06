export type SpotlightSeedTag =
  | 'perfect_park_day'
  | 'family_day_idea'
  | 'active_day_idea'
  | 'hidden_gem'
  | 'photo_worthy'
  | 'where_locals_go'

export interface TownSpotlightSeedQuery {
  tag: SpotlightSeedTag
  query: string
}

export interface TownSpotlightSeedConfig {
  townSlug: string
  townName: string
  queries: TownSpotlightSeedQuery[]
}

export const TOWN_SPOTLIGHT_SEED_CONFIG: TownSpotlightSeedConfig[] = [
  {
    townSlug: 'uxbridge',
    townName: 'Uxbridge',
    queries: [
      { tag: 'perfect_park_day', query: 'best park day plan in Uxbridge Ontario' },
      { tag: 'family_day_idea', query: 'family recreation centre in Uxbridge Ontario' },
      { tag: 'active_day_idea', query: 'scenic hiking trail near Uxbridge Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem attractions around Uxbridge Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy scenic lookout Uxbridge Ontario' },
      { tag: 'where_locals_go', query: 'popular local hangout in Uxbridge Ontario non restaurant' },
    ],
  },
  {
    townSlug: 'georgina',
    townName: 'Georgina',
    queries: [
      { tag: 'perfect_park_day', query: 'best lakeside park in Georgina Ontario' },
      { tag: 'family_day_idea', query: 'family day attraction Georgina Ontario' },
      { tag: 'active_day_idea', query: 'active outdoor adventure Georgina Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem to visit in Georgina Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy viewpoint in Georgina Ontario' },
      { tag: 'where_locals_go', query: 'where locals go for fun in Georgina Ontario (non food)' },
    ],
  },
  {
    townSlug: 'stouffville',
    townName: 'Stouffville',
    queries: [
      { tag: 'perfect_park_day', query: 'perfect park day location in Stouffville Ontario' },
      { tag: 'family_day_idea', query: 'family friendly attraction in Stouffville Ontario' },
      { tag: 'active_day_idea', query: 'active day trail or recreation near Stouffville Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem experience in Stouffville Ontario' },
      { tag: 'photo_worthy', query: 'scenic photo spot in Stouffville Ontario' },
      { tag: 'where_locals_go', query: 'popular local hangout in Stouffville Ontario that is not a restaurant' },
    ],
  },
  {
    townSlug: 'east-gwillimbury',
    townName: 'East Gwillimbury',
    queries: [
      { tag: 'perfect_park_day', query: 'best park for a day out in East Gwillimbury Ontario' },
      { tag: 'family_day_idea', query: 'family fun activity in East Gwillimbury Ontario' },
      { tag: 'active_day_idea', query: 'active outdoor experience near East Gwillimbury Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem destination around East Gwillimbury Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy scenic spot East Gwillimbury Ontario' },
      { tag: 'where_locals_go', query: 'where locals hang out in East Gwillimbury Ontario non restaurant' },
    ],
  },
  {
    townSlug: 'newmarket',
    townName: 'Newmarket',
    queries: [
      { tag: 'perfect_park_day', query: 'perfect park day destination Newmarket Ontario' },
      { tag: 'family_day_idea', query: 'family day activity Newmarket Ontario' },
      { tag: 'active_day_idea', query: 'active recreation idea Newmarket Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem to explore in Newmarket Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy location in Newmarket Ontario' },
      { tag: 'where_locals_go', query: 'popular local hangout spot in Newmarket Ontario non restaurant' },
    ],
  },
  {
    townSlug: 'aurora',
    townName: 'Aurora',
    queries: [
      { tag: 'perfect_park_day', query: 'best park for a perfect day in Aurora Ontario' },
      { tag: 'family_day_idea', query: 'family day attraction Aurora Ontario' },
      { tag: 'active_day_idea', query: 'active recreation idea Aurora Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem visit Aurora Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy scene Aurora Ontario' },
      { tag: 'where_locals_go', query: 'where locals go Aurora Ontario (non restaurant)' },
    ],
  },
  {
    townSlug: 'scugog',
    townName: 'Scugog',
    queries: [
      { tag: 'perfect_park_day', query: 'perfect park day Scugog Ontario' },
      { tag: 'family_day_idea', query: 'family friendly attraction Scugog Ontario' },
      { tag: 'active_day_idea', query: 'active outdoor adventure Scugog Ontario' },
      { tag: 'hidden_gem', query: 'hidden gem to discover in Scugog Ontario' },
      { tag: 'photo_worthy', query: 'photo worthy lake view Scugog Ontario' },
      { tag: 'where_locals_go', query: 'popular local hangout Scugog Ontario non restaurant' },
    ],
  },
]
