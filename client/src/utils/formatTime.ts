export function formatTime(date: string | Date) {
    const d = new Date(date);
    const now = new Date();

    const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    const isYesterday =
        d.getDate() === now.getDate() - 1 &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 -> 12
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${hours}:${minutesStr} ${ampm}`;

    if (isToday) return timeStr;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${timeStr}`;
}
