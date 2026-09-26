import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  Circle,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHead, Panel, PanelHead } from "@/components/admin/ui";
import { fetchAdminVendors, fetchCategories } from "@/lib/endpoints";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import type { AdminVendor } from "@/lib/types";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map — Ngila Console" },
      { name: "description", content: "Every vendor plotted on a map, with density and category-gap analysis by area." },
    ],
  }),
  component: MapPage,
});

const GOOGLE_MAPS_API_KEY = import.meta.env["VITE_GOOGLE_MAPS_API_KEY"] as string | undefined;

// Johannesburg CBD - matches the API's own default when a vendor/customer hasn't shared a
// location (see GeoUtils.DefaultLatitude/DefaultLongitude on the backend).
const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };

const PIN_COLORS = ["#c25b3c", "#4f6b52", "#c99a3d", "#a34d4d", "#3d6b8a", "#7a5ba3", "#4d8a6f"];

function colorForCategory(category: string, allCategories: string[]): string {
  const firstCategory = category.split(", ")[0] ?? category;
  const index = allCategories.indexOf(firstCategory);
  return PIN_COLORS[index < 0 ? 0 : index % PIN_COLORS.length]!;
}

function MapPage() {
  const { status } = useAuth();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: fetchAdminVendors,
    enabled: status === "authenticated",
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    enabled: status === "authenticated",
  });

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showDensity, setShowDensity] = useState(false);

  const categoryNames = useMemo(() => (categories ?? []).map((c) => c.name), [categories]);

  const pinned = useMemo(
    () => (vendors ?? []).filter((v): v is AdminVendor & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null),
    [vendors],
  );

  const filtered = useMemo(
    () => categoryFilter === "All" ? pinned : pinned.filter((v) => v.category.split(", ").includes(categoryFilter)),
    [pinned, categoryFilter],
  );

  // Grouped by each vendor's free-text location, not precise coordinates - the location string
  // ("Braamfontein, Johannesburg") is what actually reads as a business "area" for a density/gap
  // breakdown; raw lat/lng would fragment vendors on the same street into separate buckets.
  const areaBreakdown = useMemo(() => {
    const byArea = new Map<string, { vendors: (typeof pinned)[number][]; categoryCounts: Map<string, number> }>();
    for (const v of pinned) {
      if (!byArea.has(v.location)) byArea.set(v.location, { vendors: [], categoryCounts: new Map() });
      const bucket = byArea.get(v.location)!;
      bucket.vendors.push(v);
      for (const c of v.category.split(", ")) {
        bucket.categoryCounts.set(c, (bucket.categoryCounts.get(c) ?? 0) + 1);
      }
    }

    return Array.from(byArea.entries())
      .map(([area, { vendors: areaVendors, categoryCounts }]) => ({
        area,
        total: areaVendors.length,
        centerLat: areaVendors.reduce((sum, v) => sum + v.latitude, 0) / areaVendors.length,
        centerLng: areaVendors.reduce((sum, v) => sum + v.longitude, 0) / areaVendors.length,
        categoryCounts,
        missingCategories: categoryNames.filter((name) => !categoryCounts.has(name)),
        topCategory: Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0],
      }))
      .sort((a, b) => b.total - a.total);
  }, [pinned, categoryNames]);

  // How many distinct areas each category shows up in - a category present in only one or two
  // areas (while others are covered more broadly) is a candidate for expansion elsewhere.
  const categorySpread = useMemo(() => {
    const areaCountByCategory = new Map<string, number>();
    for (const { categoryCounts } of areaBreakdown) {
      for (const category of categoryCounts.keys()) {
        areaCountByCategory.set(category, (areaCountByCategory.get(category) ?? 0) + 1);
      }
    }
    return categoryNames
      .map((name) => ({ name, areaCount: areaCountByCategory.get(name) ?? 0 }))
      .sort((a, b) => a.areaCount - b.areaCount);
  }, [areaBreakdown, categoryNames]);

  return (
    <AdminShell>
      <PageHead kicker={`${pinned.length} vendors mapped`} title="Map" />

      {!GOOGLE_MAPS_API_KEY ? (
        <Panel className="p-6" delay={80}>
          <p className="text-mute">
            VITE_GOOGLE_MAPS_API_KEY isn't set for this build, so the map can't load.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Panel className="overflow-hidden p-0" delay={80}>
            <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
              <button
                onClick={() => setCategoryFilter("All")}
                className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition", categoryFilter === "All" ? "bg-ink text-paper" : "bg-surface/70 text-mute ring-1 ring-line hover:text-ink")}
              >
                All
              </button>
              {categoryNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setCategoryFilter(name)}
                  className={cn("rounded-full px-3 py-1.5 text-[12px] font-medium transition", categoryFilter === name ? "bg-ink text-paper" : "bg-surface/70 text-mute ring-1 ring-line hover:text-ink")}
                >
                  {name}
                </button>
              ))}
              <button
                onClick={() => setShowDensity((v) => !v)}
                className={cn("ml-auto rounded-full px-3 py-1.5 text-[12px] font-medium transition", showDensity ? "bg-ember text-paper" : "bg-surface/70 text-mute ring-1 ring-line hover:text-ink")}
              >
                {showDensity ? "Hide density overlay" : "Show density overlay"}
              </button>
            </div>

            <div style={{ height: 560, width: "100%" }}>
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapId="DEMO_MAP_ID"
                  defaultCenter={DEFAULT_CENTER}
                  defaultZoom={13}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                >
                  {showDensity
                    ? areaBreakdown.map((a) => (
                        <Circle
                          key={a.area}
                          center={{ lat: a.centerLat, lng: a.centerLng }}
                          radius={Math.min(120 + a.total * 40, 500)}
                          fillColor="#c25b3c"
                          fillOpacity={0.18 + Math.min(a.total, 10) * 0.03}
                          strokeColor="#c25b3c"
                          strokeOpacity={0.4}
                          strokeWeight={1}
                        />
                      ))
                    : null}
                  {filtered.map((vendor) => (
                    <VendorMarker key={vendor.id} vendor={vendor} color={colorForCategory(vendor.category, categoryNames)} />
                  ))}
                </GoogleMap>
              </APIProvider>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel className="p-5" delay={120}>
              <PanelHead title="Vendor density by area" kicker="Grouped by each listing's location text" />
              <div className="space-y-3">
                {areaBreakdown.map((a) => (
                  <div key={a.area} className="rounded-xl bg-surface/70 p-3 ring-1 ring-line">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{a.area}</p>
                      <span className="font-mono text-[12px] text-mute">{a.total} vendors</span>
                    </div>
                    {a.topCategory ? (
                      <p className="mt-1 text-[12px] text-mute">
                        Most concentrated: <span className="text-ink">{a.topCategory[0]}</span> ({a.topCategory[1]})
                      </p>
                    ) : null}
                    {a.missingCategories.length > 0 ? (
                      <p className="mt-1 text-[12px] text-mute">
                        No coverage yet: <span className="text-clay">{a.missingCategories.join(", ")}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[12px] text-moss">Every category is represented here.</p>
                    )}
                  </div>
                ))}
                {areaBreakdown.length === 0 && !isLoading ? <p className="text-mute">No mapped vendors yet.</p> : null}
              </div>
            </Panel>

            <Panel className="p-5" delay={160}>
              <PanelHead title="Categories to expand" kicker="Fewest areas covered first" />
              <div className="space-y-2">
                {categorySpread.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-[13px]">
                    <span>{c.name}</span>
                    <span className="font-mono text-[12px] text-mute">{c.areaCount} area{c.areaCount === 1 ? "" : "s"}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function VendorMarker({ vendor, color }: { vendor: AdminVendor; color: string }) {
  const [open, setOpen] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();

  if (vendor.latitude == null || vendor.longitude == null) return null;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: Number(vendor.latitude), lng: Number(vendor.longitude) }}
        onClick={() => setOpen((v) => !v)}
      >
        <Pin background={color} borderColor={color} glyphColor="#fff" />
      </AdvancedMarker>
      {open ? (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="min-w-[160px] text-[13px] text-ink">
            <p className="font-semibold">{vendor.name}</p>
            <p className="text-mute">{vendor.category}</p>
            <p>★ {vendor.rating.toFixed(1)} ({vendor.reviewsCount})</p>
            <p className="text-mute">{vendor.status}</p>
          </div>
        </InfoWindow>
      ) : null}
    </>
  );
}
