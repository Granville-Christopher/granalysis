// src/api/fetchInsights.ts
export async function fetchInsights(fileId: number) {
  try {
    const res = await fetch(`http://localhost:8000/data/${fileId}`);
    if (!res.ok) throw new Error("Failed to fetch insights");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching insights:", err);
    throw err;
  }
}
