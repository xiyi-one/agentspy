import { EventTimelineItem } from "@/components/events/event-timeline-item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { EventItem } from "@/types/domain";

export function EventTimelineList({ events }: { events: EventItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Agent timeline</CardTitle>
            <CardDescription>Timeline-friendly audit events ordered by newest first.</CardDescription>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{events.length} events</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.length === 0 ? (
          <EmptyState title="No events match this view" description="Try a different workspace, agent, or search filter once backend filtering is connected." />
        ) : null}
        {events.map((event, index) => (
          <EventTimelineItem key={event.event_id ?? event.id} event={event} isLast={index === events.length - 1} />
        ))}
      </CardContent>
    </Card>
  );
}
