import { c as createLucideIcon, r as reactExports, F as FALLBACK_MAP_LOCATION, G as GEOLOCATION_INTERVAL_MS, j as jsxRuntimeExports, B as Button, m as motion, u as ue, k as GEOLOCATION_TIMEOUT_MS, n as GEOLOCATION_HIGH_ACCURACY } from "./index-B_Nxu1v-.js";
import { A as ArrowLeft, R as RefreshCw } from "./Dashboard-D9_NeEvm.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["line", { x1: "2", x2: "5", y1: "12", y2: "12", key: "bvdh0s" }],
  ["line", { x1: "19", x2: "22", y1: "12", y2: "12", key: "1tbv5k" }],
  ["line", { x1: "12", x2: "12", y1: "2", y2: "5", key: "11lu5j" }],
  ["line", { x1: "12", x2: "12", y1: "19", y2: "22", key: "x3vr5v" }],
  ["circle", { cx: "12", cy: "12", r: "7", key: "fim9np" }],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const LocateFixed = createLucideIcon("locate-fixed", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["polygon", { points: "3 11 22 2 13 21 11 13 3 11", key: "1ltx0t" }]
];
const Navigation = createLucideIcon("navigation", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M18.36 6.64A9 9 0 0 1 20.77 15", key: "dxknvb" }],
  ["path", { d: "M6.16 6.16a9 9 0 1 0 12.68 12.68", key: "1x7qb5" }],
  ["path", { d: "M12 2v4", key: "3427ic" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const PowerOff = createLucideIcon("power-off", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode);
const FALLBACK_LOCATION = FALLBACK_MAP_LOCATION;
function formatCoord(n, decimals = 5) {
  return n.toFixed(decimals);
}
function buildMapUrl(loc) {
  const delta = 0.015;
  const bbox = [
    loc.lng - delta,
    loc.lat - delta,
    loc.lng + delta,
    loc.lat + delta
  ].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lng}`;
}
function buildNavigationUrl(loc) {
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}&travelmode=driving`;
}
function buildShareUrl(loc) {
  return `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
}
function MapPage({ onBack, trackerOn, onTurnOff }) {
  const [location, setLocation] = reactExports.useState(FALLBACK_LOCATION);
  const [loadingLocation, setLoadingLocation] = reactExports.useState(false);
  const [autoTracking, setAutoTracking] = reactExports.useState(false);
  const intervalRef = reactExports.useRef(null);
  const mapUrl = reactExports.useMemo(() => buildMapUrl(location), [location]);
  const updateLocationOnce = (showToast = false) => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        if (showToast) {
          ue.success("Location updated");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (showToast) {
          ue.error("Unable to fetch location.");
        }
      },
      {
        enableHighAccuracy: GEOLOCATION_HIGH_ACCURACY,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: 0
      }
    );
  };
  reactExports.useEffect(() => {
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
    var _a;
    const shareUrl = buildShareUrl(location);
    const shareText = `My location: ${formatCoord(location.lat)}, ${formatCoord(location.lng)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Device Location",
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
      }
    }
    if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
      try {
        await navigator.clipboard.writeText(`${shareText}
${shareUrl}`);
        ue.success("Location link copied to clipboard");
        return;
      } catch {
      }
    }
    ue.info(`Share this location: ${shareUrl}`);
  };
  const handleFindLocation = () => {
    if (!navigator.geolocation) {
      ue.error("Geolocation is not supported on this device.");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLoadingLocation(false);
        ue.success("Current location updated");
      },
      () => {
        setLoadingLocation(false);
        ue.error("Unable to fetch your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 1e4
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-[700px] flex items-center justify-between gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: onBack,
          className: "h-6 px-1.5 text-[10px] gap-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
            "Back"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: autoTracking ? "default" : "outline",
            size: "sm",
            "data-ocid": "map.auto_track_button",
            onClick: () => setAutoTracking(!autoTracking),
            className: "h-6 px-2 text-[10px] gap-1",
            children: autoTracking ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 w-1 rounded-full bg-current animate-pulse" }),
              "Tracking Live"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LocateFixed, { className: "h-3 w-3" }),
              "Start Tracking"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            "data-ocid": "map.manual_refresh_button",
            onClick: handleFindLocation,
            disabled: loadingLocation,
            className: "h-6 px-2 text-[10px] gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                RefreshCw,
                {
                  className: `h-3 w-3 ${loadingLocation ? "animate-spin" : ""}`
                }
              ),
              "Refresh"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "secondary",
            size: "sm",
            "data-ocid": "map.navigate_button",
            onClick: handleNavigate,
            className: "h-6 px-2 text-[10px] gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3 w-3" }),
              "Navigate"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            "data-ocid": "map.share_button",
            onClick: () => void handleShareLocation(),
            className: "h-6 px-2 text-[10px] gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3 w-3" }),
              "Share"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            "data-ocid": "map.off_button",
            onClick: onTurnOff,
            disabled: !trackerOn,
            className: "h-6 w-6 rounded-lg",
            title: "Turn off tracker",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              PowerOff,
              {
                className: "h-3 w-3",
                style: {
                  color: trackerOn ? "oklch(0.577 0.245 27.325)" : "oklch(0.577 0.245 27.325 / 0.3)"
                }
              }
            )
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        "data-ocid": "map.page_panel",
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        className: "mx-auto w-full max-w-[700px] rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-4 w-4 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold font-display", children: "Live Map" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground font-mono", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
              formatCoord(location.lat),
              ", ",
              formatCoord(location.lng)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "iframe",
            {
              "data-ocid": "map.page_iframe",
              title: "Device Location Map",
              src: mapUrl,
              width: "100%",
              height: "420",
              style: { border: "none", display: "block" },
              loading: "lazy",
              referrerPolicy: "no-referrer"
            }
          )
        ]
      }
    )
  ] });
}
export {
  MapPage as default
};
