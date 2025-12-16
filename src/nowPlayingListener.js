import fetch     from "node-fetch";
import { state } from "./nowPlayingState.js";

const API_URL       = "https://stream.629fm.com/api/nowplaying";
const POLL_INTERVAL = 5000; // ms

let intervalId = null;

export function startListener() {
    if (intervalId) return; // already running
    console.log("listener started....");

    async function updateState() {
        try {
            const res = await fetch(API_URL, { headers: { "User-Agent": "KosmoBot/1.0" } });
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) return;

            const stationData = data[0];
            if (!stationData || !stationData.now_playing) return;

            const np       = stationData.now_playing;
            const newTitle = np.song?.title ?? np.title ?? "Unknown";

            // Only log if the track changed
            if (newTitle !== state.title) {
                state.title     = newTitle;
                state.duration  = np.duration ?? 0;
                state.startedAt = Date.now() - (np.elapsed ?? 0) * 1000;
                state.listeners = stationData.listeners?.current ?? 0;
                state.live      = stationData.live?.is_live ?? false;

                console.log("now playing mix - ", state.title);
            }

        } catch (e) {
            console.warn("failed fetching nowplaying API - ", e.message);
        }
    }

    // Initial fetch
    updateState();

    // Poll every 5 seconds
    intervalId = setInterval(updateState, POLL_INTERVAL);
}

export function cleanup() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("listener polling cleared....");
    }
}
