export { default as RocketIllustration } from './RocketIllustration'
export { default as ClipboardIllustration } from './ClipboardIllustration'
export { default as TelescopeIllustration } from './TelescopeIllustration'
export { default as MagnifyingGlassIllustration } from './MagnifyingGlassIllustration'
export { default as CalendarIllustration } from './CalendarIllustration'
export { default as GrowthChartIllustration } from './GrowthChartIllustration'
export { default as ShieldIllustration } from './ShieldIllustration'
export { default as ConnectionIllustration } from './ConnectionIllustration'

/**
 * Map of illustration keys to components.
 * Use in EmptyState: <EmptyState illustration="rocket" />
 */
import RocketIllustration from './RocketIllustration'
import ClipboardIllustration from './ClipboardIllustration'
import TelescopeIllustration from './TelescopeIllustration'
import MagnifyingGlassIllustration from './MagnifyingGlassIllustration'
import CalendarIllustration from './CalendarIllustration'
import GrowthChartIllustration from './GrowthChartIllustration'
import ShieldIllustration from './ShieldIllustration'
import ConnectionIllustration from './ConnectionIllustration'

export const ILLUSTRATION_MAP = {
  rocket: RocketIllustration,
  clipboard: ClipboardIllustration,
  telescope: TelescopeIllustration,
  magnifyingGlass: MagnifyingGlassIllustration,
  calendar: CalendarIllustration,
  growthChart: GrowthChartIllustration,
  shield: ShieldIllustration,
  connection: ConnectionIllustration,
}
