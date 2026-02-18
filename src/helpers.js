export function progressBar(elapsed, duration, size = 20) {
    if (!duration || elapsed >= duration) return `🔴 LIVE`;

    const ratio  = Math.min(elapsed/duration, 1);
    const filled = Math.round(ratio * size);

    return `▰`.repeat(filled) + `▱`.repeat(size - filled);
}

export function truncate(str, max = 1024) {
    return str.length > max ? str.slice(0, max - 3) + "..." : str;
}