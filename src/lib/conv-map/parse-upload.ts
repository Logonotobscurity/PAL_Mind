function cueToLines(raw: string) {
  const blocks = raw.replace(/\r/g, "").split(/\n\n+/);
  const lines: string[] = [];
  for (const block of blocks) {
    const rows = block.split("\n").filter((r) => r && !/^WEBVTT/i.test(r) && !/^\d+$/.test(r));
    if (!rows.length) continue;
    let time = "";
    let text = "";
    for (const row of rows) {
      const tm = row.match(/(\d{2}:\d{2}:\d{2}[.,]\d{2,3})/);
      if (tm && row.includes("-->")) {
        time = tm[1].replace(",", ".").slice(0, 8);
        continue;
      }
      text += (text ? " " : "") + row.replace(/<[^>]+>/g, "");
    }
    if (!text) continue;
    const speakerMatch = text.match(/^([^:]{1,32}):\s*(.*)$/);
    if (speakerMatch) {
      lines.push(`[${time || "00:00:00"}] ${speakerMatch[1]}: ${speakerMatch[2]}`);
    } else {
      lines.push(`[${time || "00:00:00"}] Speaker: ${text}`);
    }
  }
  return lines.join("\n");
}

export function textFromUpload(filename: string, content: string) {
  const name = filename.toLowerCase();
  if (name.endsWith(".vtt") || name.endsWith(".srt")) return cueToLines(content);
  return content;
}
