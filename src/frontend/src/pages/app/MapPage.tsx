import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Share2,
  PowerOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { GEOLOCATION_INTERVAL_MS, GEOLOCATION_TIMEOUT_MS, GEOLOCATION_HIGH_ACCURACY, FALLBACK_MAP_LOCATION } from "../../constants";

interface MapPageProps {
  onBack: () => void;
  trackerOn: boolean;
  onTurnOff: () => void;
}

interface LocationPoint {
  lat: number;
  lng: number;
}

const FALLBACK_LOCATION: LocationPoint = FALLBACK_MAP_LOCATION;

function formatCoord(n: number, decimals = 5): string {
  return n.toFixed(decimals);
}

function buildMapUrl(loc: LocationPoint): string {
  const delta = 0.015;
  const bbox = [
    loc.lng - delta,
    loc.lat - delta,
    loc.lng + delta,
    loc.lat + delta,
  ].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
}

function buildNavigationUrl(loc: LocationPoint): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=driving`;
}

function buildShareUrl(loc: LocationPoint): string {
  return `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
}

export default function MapPage({ onBack, trackerOn, onTurnOff }: MapPageProps) {
  const [location, setLocation] = useState<LocationPoint>(FALLBACK_LOCATION);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [autoTracking, setAutoTracking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mapUrl = useMemo(() => buildMapUrl(location), [location]);

  const updateLocationOnce = (showToast = false) => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        if (showToast) {
          toast.success("Location updated");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (showToast) {
          toast.error("Unable to fetch location.");
        }
      },
      {
        enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: 0,
      },
    );
  };

  useEffect(() => {
    if (!autoTracking) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    updateLocationOnce();
    intervalRef.current = setInterval(() => {
      updateLocationOnce();
    }, GEOLOCATION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoTracking]);

  const handleNavigate = () => {
    const navUrl = buildNavigationUrl(location);
    window.open(navUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareLocation = async () => {
    const shareUrl = buildShareUrl(location);
    const shareText = `My location: ${formatCoord(location.lat)}, ${formatCoord(location.lng)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Device Location",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Continue with clipboard fallback.
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast.success("Location link copied to clipboard");
        return;
      } catch {
        // Continue to final fallback.
      }
    }

    toast.info(`Share this location: ${shareUrl}`);
  };

  const handleFindLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
        toast.success("Current location updated");
      },
      () => {
        setLoadingLocation(false);
        toast.error("Unable to fetch your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-[700px] flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-6 px-1.5 text-[10px] gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Button>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button
            type="button"
            variant={autoTracking ? "default" : "outline"}
            size="sm"
            data-ocid="map.auto_track_button"
            onClick={() => setAutoTracking(!autoTracking)}
            className="h-6 px-2 text-[10px] gap-1"
          >
            {autoTracking ? (
              <>
                <div className="h-1 w-1 rounded-full bg-current animate-pulse" />
                Tracking Live
              </>
            ) : (
              <>
                <LocateFixed className="h-3 w-3" />
                Start Tracking
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="map.manual_refresh_button"
            onClick={handleFindLocation}
            disabled={loadingLocation}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <RefreshCw
              className={`h-3 w-3 ${loadingLocation ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            data-ocid="map.navigate_button"
            onClick={handleNavigate}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <Navigation className="h-3 w-3" />
            Navigate
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            data-ocid="map.share_button"
            onClick={() => void handleShareLocation()}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <Share2 className="h-3 w-3" />
            Share
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="map.off_button"
            onClick={onTurnOff}
            disabled={!trackerOn}
            className="h-6 w-6 rounded-lg"
            title="Turn off tracker"
          >
            <PowerOff
              className="h-3 w-3"
              style={{
                color: trackerOn
                  ? "oklch(0.577 0.245 27.325)"
                  : "oklch(0.577 0.245 27.325 / 0.3)",
              }}
            />
          </Button>

        </div>
      </div>

      <motion.div
        data-ocid="map.page_panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-[700px] rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold font-display">Live Map</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <MapPin className="h-3.5 w-3.5" />
            {formatCoord(location.lat)}, {formatCoord(location.lng)}
          </div>
        </div>

        <iframe
          data-ocid="map.page_iframe"
          title="Device Location Map"
          src={mapUrl}
          width="100%"
          height="420"
          style={{ border: "none", display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
}
